<template>
    <div class="sequence" :style="{top:(book_detail.y + 45) + 'px', width: (1.2 * rem) + 'px', height: (1.2 * rem) + 'px', backgroundColor: sequenceColor}" @click="toTimelineDetail" :id="book_detail.book_name">0</div>
    <div class="timeline-container book-info-card" :style="{top:(book_detail.y + 50) + 'px', width: (7 * rem) + 'px', height: (10 * rem) + 'px'}">
        <div class="info-row book-info-card__title">
            <div class="mid-box">
                <div class="book-title" :style="{fontSize: rem + 'px'}">{{ book_detail.book_name }}</div>
            </div>
            <div class="mid-box">
                <div class="book-type" :style="{fontSize: (0.85 * rem)+ 'px', padding: (0.05 * rem) + 'px', width: rem + 'px', height: rem + 'px'}">{{ book_detail.type }}</div>
            </div>
        </div>
        <div class="info-row book-info__edition" :style="{fontSize: (0.875 * rem) + 'px'}">
            {{ book_detail.版本.split('（')[0].replace(/\?|？/i, "") }}
        </div>
        <div class="info-row book-info__loc" :style="{fontSize: (0.75 * rem) + 'px'}">
            <div class="info-row book-info__loc location">
                <svg style="width: 1em; height: 1em; transform: translateY(0.1em);"
                    t="1677920887221" class="info-row book-info__loc icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2810" >
                    <path fill="#724A2B" d="M512 88.174592c-178.7904-3.196928-326.373376 139.101184-329.663488 317.889536 0 264.907776 274.70336 529.814528 329.663488 529.814528s329.662464-264.906752 329.662464-529.814528C838.3488 227.275776 690.811904 84.978688 512 88.174592zM512 606.217216c-104.031232 0-188.379136-84.348928-188.379136-188.379136S407.968768 229.458944 512 229.458944s188.379136 84.347904 188.379136 188.378112S616.031232 606.217216 512 606.217216z" p-id="2811">
                    </path>
                </svg>
                <div class="info-row book-info__loc location_text">{{ book_detail.地點.replace(/\?|？/i, "") }}</div>      
            </div>
            <div class="info-row book-info__loc store_num">{{ book_detail.卷數.replace(/\?|？/i, "") }}</div>
        </div>
        <div class="info-row book-info__author" :style="{fontSize: (0.875 * rem) + 'px'}">
            {{ book_detail.責任者 }}
        </div>
        <!-- <div class="info-row book-info__image" style="grid-column: 1 / span 3; text-align: center;">
            <div class="source-image" v-for="src in item.source" :key="src.label">
                <img :src="src.href" style="max-width: 100%; max-height: 10vh; margin: auto; margin-top: 0.5em; margin-bottom: 0em;">
                <div style="text-align: center; color: grey; font-size: 0.3em">{{ src.label }}</div>
            </div>
        </div> -->
    </div>
    <!-- </div> -->
</template>

<script>
import { mapState } from "vuex";
import { ref, computed, watch, onMounted, reactive } from "vue";
import { color, type_color } from "@/theme";
import * as Translate from "@/theme/lang";
import { useRouter } from "vue-router";
// const router = useRouter() // 与setup()搭配

export default {
    // setup() {
    //     const router = useRouter();
    //     const toTimelineDetail = () => {
    //     router.push({
    //         name: "timelineDetail",
    //         query: this.book_detail
    //     });
    //     };
    //     //也可以这样写
    //     // function goToB() {
    //     //   router.push({
    //     //     name: "B",
    //     //   });
    //     // }
    //     return {
    //         toTimelineDetail,
    //     };
    // },
    name: "TimeLineBookCard",
    data() {
        return {
            sequenceColor: '#CFCCC9', // 此前为固定的“未详”color
            book_info_detail: {}, // 用于在div上显示
            currentBookName: null, // 当前click的书籍名称
        }
    },
    props: ['book_detail'],
    computed: {
        ...mapState(["filter", "selection", "hover", "transition", "rem", "language", "switchWholeView"])
    },
    watch:{
        selection: function (newVal, oldVal) {
            const that = this
            setTimeout(function() { // 数据传入异步性，需要setTimeout
                that.initialize()
            }, 600)
        },
        language: function(newVal, oldVal) { // 切换语言的接口
            console.log('bookCard切换语言', newVal)
            this.initialize()
        },
        switchWholeView: function(newVal, oldVal) {
            const self= this
            if (newVal === 'timeline_full') { // 显示时间线流传细节view, book_name
                // console.log('self.currentBookName', self.currentBookName)
                // self.$store.commit("changeTimelineBook", self.currentBookName) // 会把所有book_list都遍历一遍
            }
        },
    },
    methods: {
        initialize() {
            const self = this
            self.book_info_detail = JSON.parse(JSON.stringify(self.book_detail)) // 浅拷贝
            console.log("book_info_detail", self.book_info_detail)
            self.book_detail['color'] = type_color.library[self.book_detail.lib_type] // doesn't work
            // self.sequenceColor = self.book_detail['color']

            // if (self.language === 'zh') {
            //     self.book_detail.book_name = Translate.book_name_lang[self.book_detail.book_name].zh
            //     self.book_detail.type = Translate.book_types[self.book_detail.type].zh[0] // '经史子集'
            // } else if (self.language === 'en') {
            //     self.book_detail.book_name = Translate.book_name_lang[self.book_detail.book_name].en
            //     self.book_detail.type = Translate.book_types[self.book_detail.type].en
            // }
            
            // self.book_info_detail['color'] = type_color.library[self.book_info_detail.lib_type] // doesn't work
            // self.sequenceColor = self.book_info_detail['color']
            // if (self.language === 'zh') {
            //     self.book_info_detail.book_name = Translate.book_name_lang[self.book_info_detail.book_name].zh
            //     self.book_info_detail.type = Translate.book_types[self.book_info_detail.type].zh[0] // '经史子集'
            // } else if (self.language === 'en') {
            //     self.book_info_detail.book_name = Translate.book_name_lang[self.book_info_detail.book_name].en
            //     self.book_info_detail.type = Translate.book_types[self.book_info_detail.type].en
            // }
        },
        toTimelineDetail(event) {
            const self = this
            const divId = event.target.id; // 获取点击的 div 元素的 id 属性(此处id就是书籍名称)
            console.log('当前id', divId); // 输出当前点击的 div 元素的 id
            self.currentBookName = divId
            self.$store.commit("changeTimelineBook", divId)
            self.$store.commit("changeWholeView", 'timeline_full')
        }
    },
    mounted() {
        this.initialize()
    },
};
</script>

<style scoped lang="scss">
.sequence {
    position: absolute;
    left: 1.5vw;
    /*top: 7.3vh;
    width: 2vh;
    height: 2vh;
    padding: 0.1rem;*/
    color: white;
    border-radius:50%;
    /*background-color: #CFCCC9;*/
    z-index:1
}
.timeline-container {
    font-family: FZQINGKBYSJF;
    color: #8F7B6C;
    border: 1.5px dashed #8F7B6C;
    border-radius: 5px;
    
    position: absolute;
    left: 2vw;
    /*top: 8.3vh;*/
    width: 13vw;
    /*height: 15vh;*/
    padding: 0.5rem;
    overflow-y: auto;

    .info-row {
        margin-bottom: 0.1rem;
    }
    .book-info-card {
        left: 0%;
        top: 0%
    }

    .book-info-card__title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: left;
        text-align: left;

        .mid-box {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            .book-title {
                /*font-size: 1.25 * $rem + 'px';*/
                font-weight: bold;
                color: #724A2B;
            }

            .book-type {
                /*padding: 0.1 * $rem + 'px';*/
                color: white;
                background-color: #846146;
                opacity: 0.61;
            }
        }
    }
    .book-info__edition {
        text-align: justify;
        color: #724A2B;
        /*font-size: 0.875 * $rem + 'px';*/
    }
    .book-info__author{
        text-align: right;
    }

    .book-info__loc {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        /*font-size: 0.75 * $rem + 'px';*/
        /*opacity: 0.7;*/

        .location {
            display: flex;
            flex-direction: row;

            .location_text {
                color: #8F7B6C;
            }
        }
        .store_num {
            color: #8F7B6C;
        }
    }
}
</style>
