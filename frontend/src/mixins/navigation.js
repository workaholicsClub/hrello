export default {
    methods: {
        async changeUrlAndAvoidResetByVue(newHash) {
            return new Promise(resolve => {
                setTimeout(() => {
                    window.location.hash = newHash;
                    resolve();
                }, 0);
            });
        },
        updateUrl() {
            let urlHashParts = [this.currentBoardId ? this.currentBoardId : '' ];
            if (this.currentCardId) {
                urlHashParts.push(this.currentCardId);
            }

            let newHash = '!/' + urlHashParts.join('/');
            this.changeUrlAndAvoidResetByVue(newHash);
        },
    }
}