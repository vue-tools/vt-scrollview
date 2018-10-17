<style scoped>
    .vt-scroll-view {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .vt-scroll__pull-header {
        width: 100%;
        display: block;
        line-height: 80px;
        position: absolute;
        top: 0;
        z-index: 1;
        text-align: center;
        background: #f7f7f7;
    }

    .vt-scroll__content {
        width: 100%;
        flex: 1;
        position: relative;
        z-index: 2;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
        transition-duration: 0.3s;
        transition-timing-function: ease-out;
        transition-property: none;
    }

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
    <div class="vt-scroll-view">
        <div ref="pullHeader" class="vt-scroll__pull-header">{{tipText}}{{data}}</div>
        <div class="vt-scroll__content" ref="content">
            <slot></slot>
            <template v-if="loadMore">
                <div v-show="in_bottom && !ended">
                    <slot name="loading"></slot>
                    <div v-if="!$slots.loading" class="vt-scroll-view__loadmore">
                        <svg width="100" height="25" viewBox="0 0 120 30" xmlns="http://www.w3.org/2000/svg"
                             fill="#fff">
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
            </template>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return {
                in_bottom: false,
                loading: false,
                canPullRefresh: false,
                headerClientHeight: 0,
                tipText: '',
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
            },
            loadMore: {
                type: Boolean,
                default: true
            },
            pullRefresh: {
                type: Boolean,
                default: false
            },
        },
        computed: {},
        mounted() {
            this._init()
        },
        methods: {
            _init(){
                if (this.pullRefresh) {
                    this.$refs.content.addEventListener('touchstart', this._refreshTouchStart);
                    this.$refs.content.addEventListener('touchmove', this._refreshTouchMove);
                    this.$refs.content.addEventListener('touchend', this._refreshTouchEnd);
                }
                if (this.loadMore) {
                    this.$refs.content.removeEventListener('scroll', this._pageScroll)
                    this.$refs.content.addEventListener('scroll', this._pageScroll)
                }
            },
            _pageScroll() {
                if (this.end || this.loading) {
                    return
                }
                let scrollHeight = this.$refs.content.scrollHeight
                let scrollTop = this.$refs.content.scrollTop
                this.in_bottom = ((scrollHeight - this.$refs.content.clientHeight - scrollTop) < this.distance && scrollTop >= this.distance)
                if (this.in_bottom) {
                    this.loading = true
                    this.$nextTick(()=> {
                        this.$refs.content.scrollTop = scrollHeight
                        // 调用异步读取接口
                        this.$emit('next', () => {
                            this.in_bottom = false
                            this.loading = false
                        })
                    })
                }
            },

            _refreshTouchStart(e) {
                if (!this.loading && !this.canPullRefresh && this.$refs.content.scrollTop == 0) {
                    this.canPullRefresh = true
                    let touch = e.changedTouches[0];
                    this.tipText = '下拉刷新';//下拉提示文字
                    this.startY = touch.clientY;//获得当前按下点的纵坐标
                }
            },
            _refreshTouchMove(e) {
                let touch = e.changedTouches[0];
                if (!this.loading && this.canPullRefresh) {
                    if (this.headerClientHeight == 0) {
                        this.headerClientHeight = this.$refs.pullHeader.clientHeight
                    }

                    let _move = touch.clientY - this.startY;//获得滑动的距离  
                    this.offsetTop = this.$refs.content.offsetTop
                    this.$refs.content.style.marginTop = _move / (Math.ceil(_move / 1000) + 2) + 'px'
                    if (this.offsetTop >= this.headerClientHeight) {//内容主体超出了一个头部的距离      
                        this.tipText = '松开即可刷新'
                    }
                    if (_move > 0) {
                        e.preventDefault()
                    }
                } else if (!this.loading && this.$refs.content.scrollTop == 0) {
                    this.canPullRefresh = true
                    this.tipText = '下拉刷新';//下拉提示文字   
                    this.startY = touch.clientY;//获得当前按下点的纵坐标
                } else if (this.loading) {
                    e.preventDefault()
                }
            },
            _refreshTouchEnd() {
                if (!this.loading && this.canPullRefresh) {
                    this.$refs.content.style.transitionProperty = 'margin'
                    if (this.offsetTop >= this.$refs.pullHeader.clientHeight) {//内容主体超出了一个头部的距离
                        this.loading = true
                        this.tipText = '数据加载中...'//上面有了
                        this.$refs.content.style.marginTop = this.$refs.pullHeader.clientHeight + 'px'
                        this.$emit('refresh', this._resetBox)
                    } else {
                        this._resetBox();
                    }
                }
            },
            _resetBox() {
                this.offsetTop = 0
                this.$refs.content.style.marginTop = '0px'
                setTimeout(()=> {
                    this.canPullRefresh = false
                    this.loading = false
                    this.$refs.content.style.transitionProperty = 'none'
                }, 400)
            },
            scrollTop(){
                this.$refs.content.scrollTop = 0
            }
        }
    }
</script>