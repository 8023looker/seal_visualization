<template>
    <div class="library-container">
        <div class="title-name">
            {{ '收藏机构类型' }}
        </div>
        <div class="type-content library-type">
            <div class="info-row" v-for="(item, index) in TypeList.libraryTypeNum">
                <svg :style="{width: (0.75 * rem) + 'px', height: (0.75 * rem) + 'px'}" class="library-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <path :fill=item.color d="M16 30.6787C24.2843 30.6787 31 23.963 31 15.6787C31 7.39444 24.2843 0.678711 16 0.678711C7.71573 0.678711 1 7.39444 1 15.6787C1 23.963 7.71573 30.6787 16 30.6787Z"/>
                </svg>
                <div class="lib-type-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ item.lib_type + '(' + item.lib_num + ')'}}</div>
            </div>
        </div>
    </div>
    <div class="agent-container">
        <div class="title-name">
            {{ '经手人物类型' }}
        </div>
        <div class="type-content agent-type">
            <div class="info-row" v-for="(item, index) in TypeList.agentTypeNum">
                <svg :style="{width: (0.75 * rem) + 'px', height: (0.75 * rem) + 'px'}" class="agent-icon" id="_图层_2" data-name="图层 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21.32">
                    <path :fill=item.color class="cls-1" d="m13.96,20.82H2.04c-1.01,0-1.74-1.3-1.49-2.63.59-3.15,2.24-5.74,4.39-7.01,0,0,.01,0,.01-.01-1.64-1.01-2.73-2.82-2.73-4.89C2.22,3.09,4.81.5,8,.5s5.78,2.59,5.78,5.78c0,2.07-1.09,3.88-2.73,4.89,0,.01.01.01.01.01,2.15,1.27,3.8,3.86,4.39,7.01.25,1.33-.48,2.63-1.49,2.63Z"/>
                </svg>
                <div class="agent-type-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ item.agent_type + '(' + item.agent_num + ')'}}</div>
            </div>
        </div>
    </div>
    <div class="event-type-container">
        <div class="title-name">
            {{ '流传事件类型' }}
        </div>
        <div class="info-column normal">
            <svg :style="{width: (3 * rem) + 'px', height: (1.6 * rem) + 'px'}" viewBox="0 0 120 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M55.3398 2H2.08984V72.04H55.3398V2Z" stroke="#724A2B" stroke-width="2.85"/>
                <path d="M118.34 2H65.0898V72.04H118.34V2Z" stroke="#724A2B" stroke-width="2.85"/>
            </svg>
            <div class="type-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ '前后流传事件独立' }}</div>
        </div>
        <div class="info-column library-alternate">
            <svg :style="{width: (3 * rem) + 'px', height: (1.6 * rem) + 'px'}" viewBox="0 0 120 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M76.1994 36.9008L68.5394 29.7307C68.1694 29.3107 67.4594 29.0508 66.6894 29.0508H63.8494C62.2694 29.0508 61.2494 30.0907 61.9994 30.9407L69.1394 37.6207L61.9994 44.3008C61.2494 45.1608 62.2694 46.1907 63.8494 46.1907H66.6894C67.4694 46.1907 68.1694 45.9307 68.5394 45.5107L76.1994 38.3407C76.4094 38.1007 76.4694 37.8607 76.4294 37.6207C76.4694 37.3807 76.3994 37.1408 76.1994 36.9008Z" fill="#806146"/>
                <path opacity="0.8" d="M64.9806 36.9008L57.3206 29.7307C56.9506 29.3107 56.2406 29.0508 55.4706 29.0508H52.6306C51.0506 29.0508 50.0306 30.0907 50.7806 30.9407L57.9206 37.6207L50.7806 44.3008C50.0306 45.1608 51.0506 46.1907 52.6306 46.1907H55.4706C56.2506 46.1907 56.9506 45.9307 57.3206 45.5107L64.9806 38.3407C65.1906 38.1007 65.2506 37.8607 65.2106 37.6207C65.2506 37.3807 65.1806 37.1408 64.9806 36.9008Z" fill="#806146"/>
                <path opacity="0.6" d="M53.7697 36.9008L46.1097 29.7307C45.7397 29.3107 45.0297 29.0508 44.2597 29.0508H41.4197C39.8397 29.0508 38.8197 30.0907 39.5697 30.9407L46.7097 37.6207L39.5697 44.3008C38.8197 45.1608 39.8397 46.1907 41.4197 46.1907H44.2597C45.0397 46.1907 45.7397 45.9307 46.1097 45.5107L53.7697 38.3407C53.9797 38.1007 54.0397 37.8607 53.9997 37.6207C54.0397 37.3807 53.9697 37.1408 53.7697 36.9008Z" fill="#806146"/>
                <path d="M65.0898 58.7776V71.9775H118.34V1.9375H65.0898V14.3475" stroke="#724A2B" stroke-width="2.85"/>
                <path d="M55.3398 15.1276V1.9375H2.08984V71.9775H55.3398V59.0675" stroke="#724A2B" stroke-width="2.85"/>
            </svg>
            <div class="type-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ '机构的合并与更迭' }}</div>
        </div>
        <div class="info-column agent-alternate">
            <svg :style="{width: (3 * rem) + 'px', height: (1.6 * rem) + 'px'}" viewBox="0 0 111 73" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M55.7695 55.5482V15.5781" stroke="#724A2B" stroke-width="2.38"/>
                <path d="M55.3398 71.4971H2.08984V1.45703H55.3398" stroke="#724A2B" stroke-width="2.85"/>
                <path d="M55.3398 71.4971H108.59V1.45703H55.3398" stroke="#724A2B" stroke-width="2.85"/>
            </svg>
            <div class="type-name" :style="{fontSize: (0.75 * rem) + 'px'}">{{ '同机构不同经手人' }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from "vuex";

const d3 = require("d3");
const $ = require("jquery");

import * as Classification from "@/constant/classification"
import * as TypeColor from "@/theme/type_color"

export default {
    name: "TimelineLegend",
    props: ["events"],
    components: {
    },
    data() {
        return {
            TypeDict: {
                agentTypeNum: {},
                libraryTypeNum: {}
            },
            TypeList: {
                agentTypeNum: [],
                libraryTypeNum: []
            }
        };
    },
    computed: {
        ...mapState(["switchWholeView", "timelineBook", "rem"]),
    },
    watch: {
        events: {
            handler: function(newVal, oldVal) {
                const self = this
                self.initializeTypeNumber()
                self.clearTypeList()
                self.handleEventData()
            },
            deep: true
        }
    },
    methods: {
        initializeTypeNumber() {
            const self = this
            for (let i in Classification.classification.library) {
                const lib_name = Classification.classification.library[i]
                self.TypeDict.libraryTypeNum[lib_name] = 0
            }
            for (let i in Classification.classification.agent) {
                const agent_name = Classification.classification.agent[i]
                self.TypeDict.agentTypeNum[agent_name] = 0
            }
        },
        clearTypeList() {
            const self = this
            self.TypeList = {
                agentTypeNum: [],
                libraryTypeNum: []
            }
        },
        handleEventData() { // 计算不同种类收藏机构、经手人物的数目
            const self = this
            for (let i in self.events) {
                const event = self.events[i]
                if (event.lib_type === '其他') { // 其他算作不详
                    self.TypeDict.libraryTypeNum['不详'] += 1
                } else {
                    self.TypeDict.libraryTypeNum[event.lib_type] += 1
                }
                self.TypeDict.agentTypeNum[event.agent_type] += 1
            }
            // console.log('libraryTypeNum', self.TypeDict.libraryTypeNum)
            // console.log('agentTypeNum', self.TypeDict.agentTypeNum)

            // 转化为list
            for (let lib in self.TypeDict.libraryTypeNum) {
                self.TypeList.libraryTypeNum.push({
                    lib_type: lib,
                    lib_num: self.TypeDict.libraryTypeNum[lib],
                    color: TypeColor.library[lib]
                })
            }
            for (let agent in self.TypeDict.agentTypeNum) {
                self.TypeList.agentTypeNum.push({
                    agent_type: agent,
                    agent_num: self.TypeDict.agentTypeNum[agent],
                    color: TypeColor.agent[agent]
                })
            }
            // console.log('TypeList', self.TypeList)
        }
    },
    mounted() {
        this.initializeTypeNumber()
    },
};
</script>

<style scoped lang="scss">
.library-container{
    position: absolute;
    height: 20%;
    width: 100%;
    top: 33%;
    
}
.agent-container{
    position: absolute;
    height: 20%;
    width: 100%;
    top: 53%;
}
.event-type-container{
    position: absolute;
    height: 27%;
    width: 100%;
    top: 73%;
    .info-column{
        display: flex;
        flex-direction: column;
        gap: 5%;
        align-items: center; // new
        margin: 8%;
        .type-name{
            margin: 8%;
        }
    }
}
.info-row{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center; // new
    margin: 8%;
}
.type-content{
    position: absolute;
    left: 10%;
    width: 80%;
}
</style>
