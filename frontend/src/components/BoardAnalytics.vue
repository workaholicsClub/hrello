<template>
    <v-main class="fill-height">
        <v-row class="mx-2 mx-md-4">
            <v-col cols="12" md="6" lg="4" v-for="graph in graphs" :key="graph.id">
                <v-card>
                    <v-card-text>
                        <bar-chart :chart-data="graph" :options="graph.options"></bar-chart>
                    </v-card-text>
                </v-card>
            </v-col>

        </v-row>
    </v-main>
</template>

<script>
    import BoardsCommon from "@/mixins/BoardsCommon";
    import BarChart from "@/components/Charts/BarChart";
    import moment from "moment";
    import axios from "axios";

    export default {
        name: "BoardAnalytics",
        components: {BarChart},
        mixins: [ BoardsCommon ],
        data() {
            return {
                isLoading: false,
                stats: false,
            }
        },
        mounted() {
            this.loadBoardStats();
        },
        methods: {
            async loadBoardStats() {
                this.isLoading = true;

                let statResponse = await axios.get('/api/board/stats', {
                    params: {
                        boardId: this.boardId,
                    }
                });

                this.stats = statResponse.data.stats;
                this.isLoading = false;
            }
        },
        computed: {
            statusCountGraph() {
                let labels = this.stats.count.map( countItem => countItem.statusTitle );
                let cardCount = this.stats.count.map( countItem => countItem.cardsCount );
                let totalCardsCount = cardCount.reduce( (sum, count) => sum+count );

                return {
                    id: 'statusCountGraph',
                    labels: labels,
                    datasets: [{
                        data: cardCount,
                    }],
                    options: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Воронка кандидатов'
                        },
                        tooltips: {
                            callbacks: {
                                label(labelData) {
                                    let percent = Math.round(labelData.xLabel * 100/ totalCardsCount);
                                    return `${labelData.value}, ${percent}%`
                                }
                            }
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                }
                            }],
                        }
                    },
                }
            },

            statusTimeGraph() {
                let labels = this.stats.time.map( timeItem => timeItem.statusTitle );
                let statusDays = this.stats.time.map( timeItem => {
                    return moment.duration(timeItem.avgTime, 'seconds').asDays();
                });

                return {
                    id: 'statusTimeGraph',
                    labels: labels,
                    datasets: [{
                        data: statusDays,
                    }],
                    options: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Среднее время в статусе'
                        },
                        tooltips: {
                            callbacks: {
                                label(duration) {
                                    return moment.duration(duration.xLabel, 'days').humanize();
                                }
                            }
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                }
                            }],
                        }
                    },
                }
            },

            overdueGraph() {
                let labels = this.stats.time.map( timeItem => timeItem.statusTitle );

                let overdue = [];
                let severeOverdue = [];
                let noOverdue = [];

                for (const timeStatItem of this.stats.time) {
                    overdue.push(timeStatItem.overdue);
                    severeOverdue.push(timeStatItem.severeOverdue);
                    noOverdue.push( timeStatItem.totalCardsWithTime - timeStatItem.overdue - timeStatItem.severeOverdue );
                }

                return {
                    id: 'overdueGraph',
                    labels: labels,
                    datasets: [
                        {
                            label: 'Без просрочки',
                            backgroundColor: 'rgba(0,255,0,0.5)',
                            data: noOverdue,
                        },
                        {
                            label: 'Просрочено',
                            backgroundColor: 'rgba(255,255,0,0.5)',
                            data: overdue,
                        },
                        {
                            label: 'Сильно просрочено',
                            backgroundColor: 'rgba(255,0,0,0.5)',
                            data: severeOverdue,
                        },
                    ],
                    options: {
                        legend: {
                            display: true,
                        },
                        title: {
                            display: true,
                            text: 'Просрочка по статусам'
                        },
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                },
                                stacked: true,
                            }],
                            yAxes: [{
                                stacked: true
                            }]
                        }
                    },
                }
            },

            graphs() {
                if (!this.stats) {
                    return [];
                }

                return [
                    this.statusCountGraph,
                    this.statusTimeGraph,
                    this.overdueGraph,
                ]
            }
        }
    }
</script>

<style scoped>

</style>