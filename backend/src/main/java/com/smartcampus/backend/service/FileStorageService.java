package com.smartcampus.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE_BYTES = 25 * 1024; // 25KB

    static {
        // Ensure SPI-provided readers (e.g. TwelveMonkeys WebP) are registered.
        ImageIO.scanForPlugins();
    }

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        return storeFile(file, true);
    }

    public String storeFile(MultipartFile file, boolean enforceSizeLimit) throws IOException {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = getExtension(originalFileName);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File type not supported. Allowed: JPG, JPEG, PNG, WEBP");
        }

        if (!isContentTypeAllowed(file.getContentType(), extension)) {
            throw new IllegalArgumentException("Invalid file content type. Upload a valid image");
        }

        if (enforceSizeLimit && file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File size exceeds 25 KB limit");
        }

        validateImageBytes(file, extension);

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "." + extension;
        Path target = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + fileName;
    }

    /**
     * Browsers sometimes send {@code application/octet-stream} or omit Content-Type for file inputs.
     * WebP is especially prone to mismatched types while still being a valid image.
     */
    private boolean isContentTypeAllowed(String contentType, String extension) {
        if (contentType == null || contentType.isBlank()) {
            return true;
        }
        String ct = contentType.trim().toLowerCase(Locale.ROOT);
        if (ALLOWED_CONTENT_TYPES.contains(ct)) {
            return true;
        }
        return "application/octet-stream".equals(ct) && ALLOWED_EXTENSIONS.contains(extension);
    }

    /**
     * JDK {@link ImageIO} often cannot decode WebP even with plugins on some runtimes.
     * For {@code .webp} we validate the standard RIFF container signature instead.
     */
    private void validateImageBytes(MultipartFile file, String extension) throws IOException {
        if ("webp".equals(extension)) {
            try (var inputStream = file.getInputStream()) {
                byte[] header = inputStream.readNBytes(12);
                if (!isRiffWebPHeader(header)) {
                    throw new IllegalArgumentException("Invalid image file");
                }
            }
            return;
        }

        try (var inputStream = file.getInputStream()) {
            var image = ImageIO.read(inputStream);
            if (image == null) {
                throw new IllegalArgumentException("Invalid image file");
            }
        }
    }

    private static boolean isRiffWebPHeader(byte[] header) {
        if (header == null || header.length < 12) {
            return false;
        }
        return header[0] == 'R'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == 'F'
                && header[8] == 'W'
                && header[9] == 'E'
                && header[10] == 'B'
                && header[11] == 'P';
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException("Uploaded file must have a valid extension");
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
