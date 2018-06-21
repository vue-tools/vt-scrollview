<style scoped>
    .vt-scroll-view__loadmore,
    .vt-scroll__loaded {
        width: 100%;
        font-size: 24px;
        overflow: hidden;
        position: relative;
        display: flex;
        height: 60px;
        line-height: 60px;
        justify-content: center;
        align-items: center;
    }

    .vt-scroll-view__loadmore {
        padding-right: 40px;
    }

    .vt-scroll-view__loading-text {
        display: inline-block;
        margin-left: 20px;
        position: relative;
    }

    .vt-scroll-view__loading-text:after {
        content: '';
        animation-name: loading-text;
        animation-timing-function: linear;
        animation-duration: 1.5s;
        animation-iteration-count: infinite;
        position: absolute;
        line-height: 55px;
        left: 76px;
        bottom: 0;
    }

    @keyframes loading-text {
        0% {
            content: ".";
        }
        33% {
            content: "..";
        }
        66% {
            content: "...";
        }
        100% {
            content: "";
        }
    }
</style>
<template>
    <div ref="scroll">
        <slot></slot>
        <div v-show="in_bottom && !ended">
            <slot name="loading"></slot>
            <div v-if="!$slots.loading" class="vt-scroll-view__loadmore">
                <svg width="100" height="25" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg" fill="#fff">
                    <circle fill="rgb(197,103,1)" cx="15" cy="15" r="15">
                        <animate attributeName="r" from="15" to="15"
                                 begin="0s" dur="0.8s"
                                 values="15;9;15" calcMode="linear"
                                 repeatCount="indefinite"/>
                        <animate attributeName="fill-opacity" from="1" to="1"
                                 begin="0s" dur="0.8s"
                                 values="1;.5;1" calcMode="linear"
                                 repeatCount="indefinite"/>
                    </circle>
                    <circle fill="rgb(223,244,100)" cx="60" cy="15" r="9" fill-opacity="0.3">
                        <animate attributeName="r" from="9" to="9"
                                 begin="0s" dur="0.8s"
                                 values="9;15;9" calcMode="linear"
                                 repeatCount="indefinite"/>
                        <animate attributeName="fill-opacity" from="0.5" to="0.5"
                                 begin="0s" dur="0.8s"
                                 values=".5;1;.5" calcMode="linear"
                                 repeatCount="indefinite"/>
                    </circle>
                    <circle fill="rgb(100,133,244)" cx="105" cy="15" r="15">
                        <animate attributeName="r" from="15" to="15"
                                 begin="0s" dur="0.8s"
                                 values="15;9;15" calcMode="linear"
                                 repeatCount="indefinite"/>
                        <animate attributeName="fill-opacity" from="1" to="1"
                                 begin="0s" dur="0.8s"
                                 values="1;.5;1" calcMode="linear"
                                 repeatCount="indefinite"/>
                    </circle>
                </svg>
                <span class="vt-scroll-view__loading-text">{{loadingText}}</span>
            </div>
        </div>
        <div v-show="end">
            <slot name="loaded"></slot>
            <div v-if="!$slots.loaded" v-show="loadedText" class="vt-scroll__loaded">{{loadedText}}</div>
        </div>
    </div>
</template>
<script>
    import {getScrollElement} from './utils'

    export default {
        data(){
            return {
                in_bottom: false,
                loading: false
            }
        },
        props: {
            loadingText: {
                type: String,
                default: '加载中'
            },
            loadedText: {
                type: String,
                default: '没有更多数据了'
            },
            distance: {
                type: Number,
                default: 30
            },
            end: {
                type: Boolean,
                default: false
            }
        },
        computed: {},
        mounted() {
            const el = getScrollElement(this.$refs.scroll)
            if (typeof el.addEventListener === 'function') {
                el.addEventListener('scroll', this.pageScroll.bind(this, el))
            }
        },
        methods: {
            pageScroll(el) {
                if (this.end || this.loading) {
                    return
                }
                let scrollHeight = el.scrollHeight
                let scrollTop = el.scrollTop
                this.in_bottom = ((scrollHeight - el.clientHeight - scrollTop) < this.distance && scrollTop >= this.distance)
                if (this.in_bottom) {
                    this.loading = true
                    this.$nextTick(()=> {
                        el.scrollTop = scrollHeight
                        // 调用异步读取接口
                        this.$emit('next', () => {
                            this.in_bottom = false
                            this.loading = false
                        })
                    })
                }
            }
        }
    }
</script>