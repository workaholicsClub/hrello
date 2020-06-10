import Timetable from "./components/Timetable";
import AnalyticsBoard from "./components/AnalyticsBoard";
import CardArchive from "./components/CardArchive";
import VacancyTextEditor from "./components/VacancyTextEditor";
import SmartCard from "./components/SmartCard";

const routes = [
    { name: 'timetable', path: '/timetable', component: Timetable },
    { name: 'archive', path: '/archive/:type', component: CardArchive },
    { name: 'vacancy', path: '/:boardId/vacancy', component: VacancyTextEditor },
    { name: 'card', path: '/:boardId/:cardId', component: SmartCard },
    { name: 'board', path: '/:boardId', component: AnalyticsBoard },
]

export default routes;

