<template>
    <div class="daily">
        <div class="daily-menu">
            <div class="daily-menu-item" :class="{on:type === 'recommend'}" @click="handleToRecommend">每日推荐</div>
            <div class="daily-menu-item" :class="{on:type === 'daily'}" @click="showThemes = !showThemes">主题日报</div>
            <ul v-show="showThemes">
                <li v-for="item in themes">
                    <a :class="{on:item.id === themeId && type === 'daily'}" @click="handleToTheme(item.id)">
                        {{item.name}}
                    </a>
                </li>
            </ul>
        </div>
        <div class="daily-list" ref="list" @scroll="handleScroll">
            <template v-if="type === 'recommend'">
                <div v-for="list in recommendList">
                    <div class="daily-date">{{formatDay(list.date)}}</div>
                    <Item
                            v-for="item in list.stories"
                            :data="item"
                            :key="item.id"
                            @click.native="handleClick(item.id)"
                    ></Item>
                </div>
            </template>
            <template v-if="type === 'daily'">
                <Item
                        v-for="item in list"
                        :data="item"
                        :key="item.id"
                        @click.native="handleClick(item.id)"
                ></Item>
            </template>
        </div>
        <daily-article :id="articleId"></daily-article>
    </div>
</template>
<script>
    import $ from './libs/util'
    import Item from './components/item.vue'
    import dailyArticle from './components/daily-article.vue'

    export default {
        components: {
            Item,
            dailyArticle
        },
        data() {
            return {
                themes: [],
                showThemes: false,
                type: 'recommend',
                themeId: 0,
                list: [],
                dailyTime: $.getTodayTime(),
                isLoading: false,
                recommendList: [],
                articleId: 0
            }
        },
        mounted() {
            //初始化时调用
            this.getThemes();
            this.getRecommendList();
        },
        methods: {
            handleClick(id) {
                this.articleId = id;
                console.log("点击");
            },
            handleScroll() {
                const $list = this.$refs.list;
                if (this.type === 'daily' || this.isLoading) return;
                if ($list.scrollTop + document.body.clientHeight >= $list.scrollHeight) {
                    this.dailyTime -= 86400000;
                    this.getRecommendList()
                }
            },
            formatDay(date) {
                let month = date.substr(4, 2);
                let day = date.substr(6, 2);
                if (month.substr(0, 1) === '0') month = month.substr(1, 1);
                if (day.substr(0, 1) === '0') day = day.substr(1, 1);
                return `${month}月${day}日`;
            },
            handleToRecommend() {
                this.type = 'recommend';
                this.recommendList = [];
                this.dailyTime = $.getTodayTime();
                this.getRecommendList();
            },
            getRecommendList() {
                this.isLoading = true;
                const prevDay = $.prevDay(this.dailyTime + 86400000);
                $.ajax.get('news/before/' + prevDay).then(res => {
                    this.recommendList.push(res);
                    this.isLoading = false;
                })
            },
            getThemes() {
                $.ajax.get('themes').then(res => {
                    this.themes = res.others;
                    console.log(this.themes);
                })
            },
            handleToTheme(id) {
                //改变菜单分类
                this.type = 'daily';
                //设置当前点击子类的主题日报id
                this.themeId = id;
                //清空中间栏数据
                this.list = [];
                $.ajax.get('theme/' + id).then(res => {
                    this.list = res.stories.filter(item => item.type !== 1);

                    console.log(this.list);

                })
            }
        },

    }
</script>