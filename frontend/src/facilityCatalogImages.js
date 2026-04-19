/**
 * Local catalogue imagery (Vite-bundled from src/assets).
 * Used when API imageUrl is missing, 404, or not reachable (e.g. backend not running).
 */
import labImg from './assets/Education-Computer-Lab-Furniture-Slide-001.jpg';
import meetingImg from './assets/OIP2.jpg';
import lectureImg from './assets/Roskens_media_3-2000x933.jpg';
import equipmentImg from './assets/4.jpg';
import commonImg from './assets/d4964ced69c0a595a33cfb8f8a352eac.jpg';
import sportsImg from './assets/_mcw9785__large.jpg';
import auditoriumImg from './assets/9026680628_441ea6d664_b.jpg';
import seminarImg from './assets/Mythware-E-Learning-Class-Software.jpg';
import defaultImg from './assets/download8.jpg';

export const catalogImageByType = {
  LAB: labImg,
  LECTURE_HALL: lectureImg,
  MEETING_ROOM: meetingImg,
  EQUIPMENT: equipmentImg,
  COMMON_AREA: commonImg,
  SPORTS_FACILITY: sportsImg,
  AUDITORIUM: auditoriumImg,
  SEMINAR_ROOM: seminarImg
};

export const catalogDefaultImage = defaultImg;
