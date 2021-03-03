<template>
  <div class="flex-container">
    <div id="main">
      <Panel shadow :padding="10" >
        <div slot="title">
          {{title}}
        </div>
        <div slot="extra">
          <Button v-if="listVisible" type="info" @click="init" :loading="btnLoading"><span class="ivu-icon ivu-icon-refresh"></span> {{$t('m.Refresh')}}</Button>
          <Button v-else type="ghost" icon="ios-undo" @click="goBack">{{$t('m.Back')}}</Button>
        </div>
        <transition-group name="announcement-animate" mode="in-out">
          <div class="no-announcement" v-if="!announcements.length" key="no-announcement">
            <p>{{$t('m.No_Announcements')}}</p>
          </div>
          <template v-if="listVisible">
            <ul class="announcements-container" key="list">
              <li v-for="announcement in announcements" :key="announcement.title">
                <div class="flex-container">
                  <div class="title"><a class="entry" @click="goAnnouncement(announcement)">
                    {{announcement.title}}</a></div>
                  <div class="date">{{announcement.create_time | localtime }}</div>
                  <div class="creator"> {{$t('m.By')}} {{announcement.created_by.username}}</div>
                </div>
              </li>
            </ul>
            <Pagination v-if="!isContest"
                        key="page"
                        :total="total"
                        :page-size="limit"
                        @on-change="getAnnouncementList">
            </Pagination>
          </template>

          <template v-else>
          <div v-katex v-html="announcement.content" key="content" class="content-container markdown-body"></div>
          </template>
        </transition-group>
      </Panel>
      <Row v-if="!isContest" type="flex" :gutter="10" style="margin-top: 70px;">
        <Col :span="12">
            <Panel shadow style="padding-top: 0px;padding-bottom: 10px;">
            <div slot="title" style="margin-left: -10px;margin-bottom: -10px;">Bài tập mới</div>
            <ul style="margin-left: 40px;margin-bottom: 20px;">
                <li style="padding: 5px 0px;"  v-for="p in problemList" :key="p.id">
                <a class="link-style" :href="'/problem/' + p._id">{{p._id}} - {{p.title}}</a>
                </li>
            </ul>
            </Panel>
        </Col>
        <Col :span="12">
          <Panel shadow style="padding-top: 0px;padding-bottom: 10px;">
            <div slot="title" style="margin-left: -10px;margin-bottom: -10px;">Về CodeTrain</div>
            <div class="content-container markdown-body">
              <b style="color:red">Code</b><b style="color:yellow">Train</b> chính thức đi vào hoạt động công khai ngày 25/02/2021. Bằng tất cả tâm huyết, mình muốn đem lại cho tất cả mọi người một hệ thống luyện tập lập trình trực tuyến hiệu quả nhất, đặc biệt dành cho các bạn học sinh, sinh viên đam mê code, giải thuật! <br /> Chúc các bạn luyện tập vui vẻ!

            </div>
          </Panel>
        </Col>
    </Row>
    </div>

    <div v-if="!isContest" id="right-column">
      <Panel shadow style="padding-top: 0px;padding-bottom: 10px;min-height: 400px;">
        <div slot="title" style="margin-left: -10px;margin-bottom: -10px;">Top 20 PRO</div>
        <ol style="margin-left: 40px;margin-bottom: 20px;">
          <li v-for="u in dataRank" :key="u.id" style="margin-top:4px;">
            <a :style="'font-weight: 600;color: ' + u.color" :href="'/user-home?username=' + u.user.username"
               :title="u.title + ' ' + u.user.username">
            {{u.user.username}}
            </a> đã giải {{u.accepted_number}} bài
          </li>
        </ol>
      </Panel>
    </div>
  </div>
</template>

<script>
  import api from '@oj/api'
  import Pagination from '@oj/components/Pagination'
  import { mapState } from 'vuex'
  import { RULE_TYPE, USER_GRADE } from '@/utils/constants'
  export default {
    name: 'Announcement',
    components: {
      Pagination
    },
    data () {
      return {
        limit: 10,
        total: 10,
        dataRank: [],
        rankLimit: 20,
        problemList: [],
        problemLimit: 15,
        query: {
          keyword: '',
          difficulty: '',
          tag: '',
          page: 1,
          orderby: '-create_time'
        },
        btnLoading: false,
        announcements: [],
        announcement: '',
        listVisible: true
      }
    },
    mounted () {
      this.init()
      this.getRankData()
      this.getProblemList()
    },
    methods: {
      init () {
        if (this.isContest) {
          this.getContestAnnouncementList()
        } else {
          this.getAnnouncementList()
        }
      },
      getRankData () {
        api.getUserRank(0, this.rankLimit, RULE_TYPE.ACM).then(res => {
          this.dataRank = res.data.data.results
          for (let i in this.dataRank) {
            this.dataRank[i]['color'] = USER_GRADE[this.dataRank[i].grade].color
            this.dataRank[i]['title'] = USER_GRADE[this.dataRank[i].grade].name
          }
        }).catch(() => {
        })
      },
      getProblemList () {
        let offset = 0
        api.getProblemList(offset, this.problemLimit, this.query).then(res => {
          this.problemList = res.data.data.results
          console.log(res.data.data.results)
        })
      },
      getAnnouncementList (page = 1) {
        this.btnLoading = true
        api.getAnnouncementList((page - 1) * this.limit, this.limit).then(res => {
          this.btnLoading = false
          this.announcements = res.data.data.results
          this.total = res.data.data.total
        }, () => {
          this.btnLoading = false
        })
      },
      getContestAnnouncementList () {
        this.btnLoading = true
        api.getContestAnnouncementList(this.$route.params.contestID).then(res => {
          this.btnLoading = false
          this.announcements = res.data.data
        }, () => {
          this.btnLoading = false
        })
      },
      goAnnouncement (announcement) {
        this.announcement = announcement
        this.listVisible = false
      },
      goBack () {
        this.listVisible = true
        this.announcement = ''
      }
    },
    computed: {
      title () {
        if (this.listVisible) {
          return this.isContest ? this.$i18n.t('m.Contest_Announcements') : this.$i18n.t('m.Announcements')
        } else {
          return this.announcement.title
        }
      },
      isContest () {
        return !!this.$route.params.contestID
      }
    }
  }
</script>

<style scoped lang="less">
.announcements-container {
    margin-top: -10px;
    margin-bottom: 10px;
    li {
      padding-top: 15px;
      list-style: none;
      padding-bottom: 15px;
      margin-left: 20px;
      font-size: 16px;
      border-bottom: 1px solid rgba(187, 187, 187, 0.5);
      &:last-child {
        border-bottom: none;
      }
      .flex-container {
        .title {
          flex: 1 1;
          text-align: left;
          padding-left: 10px;
          a.entry {
            color: #495060;
            &:hover {
              color: #2d8cf0;
              border-bottom: 1px solid #2d8cf0;
            }
          }
        }
        .creator {
          flex: none;
          width: 200px;
          text-align: center;
        }
        .date {
          flex: none;
          width: 200px;
          text-align: center;
        }
      }
    }
  }
  .content-container {
    padding: 0 20px 20px 20px;
  }
  .no-announcement {
    text-align: center;
    font-size: 16px;
  }changeLocale
  .announcement-animate-enter-active {
    color: rgba(255, 255, 255, 0.5);
    animation: fadeIn 1s;
  }
  .nowWeek {
    text-align: center;
    padding-top: 20px;
    font-size: 25px;
    font-weight: 600;
  }
  .nowDate {
    text-align: center;
    padding-bottom: 10px;
    font-size: 30px;
    font-weight: 600;
  }
  .tag-btn {
    margin-right: 10px;
    margin-bottom: 20px;
  }
  .tag-btn:hover {
    a {
       color: #2d8cf0;
    }
  }
  .link-style {
    color:#264c67
  }
  .link-style:hover {
    color: #2d8cf0;
  }
  .ivu-btn-text {
    color: #57a3f3;
  }
  .flex-container {
    #main {
      flex: auto;
      margin-right: 18px;
      .filter {
        margin-right: -10px;
      }
    }
    #contest-menu {
      flex: none;
      width: 210px;
    }
    #right-column {
      flex: none;
      width: 300px;
      max-width: 300px;
    }
  }
</style>
