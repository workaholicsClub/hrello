import Timetable from "./components/Timetable";
import BoardView from "./components/BoardView";
import CardArchive from "./components/CardArchive";
import VacancyEditor from "./components/VacancyEditor";
//import SmartCard from "./components/SmartCard";
import BoardList from "@/components/BoardList";
import ListBoard from "@/components/Boards/ListBoard";
import BoardAnalytics from "@/components/BoardAnalytics";

const routes = [
    { name: 'timetable', path: '/timetable/:cardId?', component: Timetable, title: 'Расписание' },
    { name: 'newBoard', path: '/new', component: VacancyEditor },
    { name: 'archive', path: '/archive/:type', component: CardArchive },
    { name: 'group', path: '/group/:groupId/:cardId?', component: ListBoard },
    { name: 'candidates', path: '/candidates/:cardId?', component: ListBoard },
    { name: 'vacancy', path: '/:boardId/vacancy', component: VacancyEditor },
    { name: 'stats', path: '/:boardId/stats', component: BoardAnalytics },
    { name: 'card', path: '/:boardId/:cardId', component: BoardView },
    { name: 'board', path: '/:boardId', component: BoardView },
    { name: 'home', path: '/', component: BoardList, title: 'Мои вакансии' },
]

export default routes;

