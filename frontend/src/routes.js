import Timetable from "./components/Timetable";
import BoardView from "./components/BoardView";
import CardArchive from "./components/CardArchive";
import VacancyTextEditor from "./components/VacancyTextEditor";
import SmartCard from "./components/SmartCard";
import BoardList from "@/components/BoardList";

const routes = [
    { name: 'timetable', path: '/timetable', component: Timetable, title: 'Расписание' },
    { name: 'archive', path: '/archive/:type', component: CardArchive },
    { name: 'vacancy', path: '/:boardId/vacancy', component: VacancyTextEditor },
    { name: 'card', path: '/:boardId/:cardId', component: SmartCard },
    { name: 'board', path: '/:boardId', component: BoardView },
    { name: 'home', path: '/', component: BoardList, title: 'Мои вакансии' },
]

export default routes;

