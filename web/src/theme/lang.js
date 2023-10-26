import * as BookTraj from "@/data/BookTraj_old"
export const book_types = {
    经部: {
        zh: "经部",
        zh_0: "经",
        en: "Classics",
        en_0: "Cl"
    },
    史部: {
        zh: "史部",
        zh_0: "史",
        en: "Histories",
        en_0: "H"
    },
    子部: {
        zh: "子部",
        zh_0: "子",
        en: "Masters",
        en_0: "M"
    },
    集部: {
        zh: "集部",
        zh_0: "集",
        en: "Collections",
        en: "Co"
    }
};

export const library_types = {
    机构类型: {
        zh: "机构类型",
        en: "organization type"
    },
    皇家: {
        zh: "皇家",
        en: "Royal family"
    },
    公家: {
        zh: "公家",
        en: "Public family"
    },
    大學: {
        zh: "大學",
        en: "college"
    },
    寺廟: {
        zh: "寺廟",
        en: "temple"
    },
    私人: {
        zh: "私人",
        en: "private"
    },
    不详: {
        zh: "不详",
        en: "unknown"
    },
    其他: {
        zh: "其他",
        en: "others"
    }
};

export const agent_types = {
    人物类型: {
        zh: "人物类型",
        en: "character type"
    },
    皇室: {
        zh: "皇室",
        en: "royal family"
    },
    官員: {
        zh: "官員",
        en: "official"
    },
    學者: {
        zh: "學者",
        en: "scholar"
    },
    僧侶: {
        zh: "僧侶",
        en: "monk"
    },
    商人: {
        zh: "商人",
        en: "businessmen"
    },
    不详: {
        zh: "不详",
        en: "unkonwn"
    }
};

export const dynasties = {
    China: {
        宋: {
            zh: "宋",
            en: "Song"
        },
        元: {
            zh: "元",
            en: "Yuan"
        },
        明: {
            zh: "明",
            en: "Ming"
        },
        清: {
            zh: "清",
            en: "Qing"
        },
        民国: {
            zh: "民国",
            en: "Republic of China"
        }
    },
    Japan: {
        平安: {
            zh: "平安",
            en: "Heian Period"
        },
        镰仓: {
            zh: "镰仓",
            en: "Kamakura Period"
        },
        南北朝: {
            zh: "南北朝",
            en: "North and South Dynasties"
        },
        室町: {
            zh: "室町",
            en: "Muromachi Period"
        },
        江户: {
            zh: "江户",
            en: "Edo Period"
        },
        明治: {
            zh: "明治",
            en: "Meiji Period"
        },
        大正: {
            zh: "大正",
            en: "Taisho Period"
        },
        昭和: {
            zh: "昭和",
            en: "Showa Period"
        }
    }
};

export const axis_labels = {
    '时间（公元）': { // 有中文括号，就用引号引起来
        zh: "时间（公元）",
        en: "Time (AD)"
    },
    中国朝代: {
        zh: "中国朝代",
        en: "Chinese Dynasty"
    },
    日本朝代: {
        zh: "日本朝代",
        en: "Japanese Dynasty"
    },
    刊刻: {
        zh: "刊刻",
        en: "Engrave"
    },
    最后一次在中国: {
        zh: "最后一次在中国",
        en: "Last Seen in China"
    },
    首次传入日本: {
        zh: "首次传入日本",
        en: "First Introduced to Japan"
    }
};

// export const locations = {
//     中国: { zh: "中国", en: "China" },
// };

export const locations = {
    "京都府": {
        "zh": "京都府",
        "en": "Kyoto"
    },
    "東京都": {
        "zh": "東京都",
        "en": "Tokyo",
    },
    "高麗": {
        "zh": "高麗",
        "en": "Koryo"
    },
    "東陽": {
        "zh": "東陽",
        "en": "Dongyang"
    },
    "岡山": {
        "zh": "岡山",
        "en": "Okayama"
    },
    "奈良": {
        "zh": "奈良",
        "en": "Nara"
    },
    "鐮倉": {
        "zh": "鐮倉",
        "en": "Kamakura"
    },
    "蒲生": {
        "zh": "蒲生",
        "en": "Burson"
    },
    "四川": {
        "zh": "四川",
        "en": "Sichuan"
    },
    "大分": {
        "zh": "大分",
        "en": "Oita"
    },
    "湖南": {
        "zh": "湖南",
        "en": "Hunan"
    },
    "肇慶": {
        "zh": "肇慶",
        "en": "Zhaoqing"
    },
    "福建": {
        "zh": "福建",
        "en": "Fujian"
    },
    "文京": {
        "zh": "文京",
        "en": "Bunkyo"
    },
    "吉林": {
        "zh": "吉林",
        "en": "Jilin"
    },
    "大阪": {
        "zh": "大阪",
        "en": "Osaka"
    },
    "舒縣": {
        "zh": "舒縣",
        "en": "Shu County"
    },
    "高知": {
        "zh": "高知",
        "en": "Kochi"
    },
    "內務省": {
        "zh": "內務省",
        "en": "Ministry of Internal Affairs"
    },
    "京都": {
        "zh": "京都",
        "en": "Kyoto"
    },
    "安徽": {
        "zh": "安徽",
        "en": "Anhui"
    },
    "陽新": {
        "zh": "陽新",
        "en": "Yangxin"
    },
    "正定": {
        "zh": "正定",
        "en": "Zhengding"
    },
    "上野忍岡": {
        "zh": "上野忍岡",
        "en": "Nobuoka Ueno"
    },
    "東山道地區": {
        "zh": "東山道地區",
        "en": "Higashiyama area"
    },
    "朝鮮": {
        "zh": "朝鮮",
        "en": "North Korea"
    },
    "中國": {
        "zh": "中國",
        "en": "China"
    },
    "姬路": {
        "zh": "姬路",
        "en": "Himeji"
    },
    "杭州": {
        "zh": "杭州",
        "en": "Hangzhou"
    },
    "首爾": {
        "zh": "首爾",
        "en": "Seoul"
    },
    "四國": {
        "zh": "四國",
        "en": "Shikoku"
    },
    "廣東": {
        "zh": "廣東",
        "en": "Guangdong"
    },
    "寧波": {
        "zh": "寧波",
        "en": "Ningbo"
    },
    "東山": {
        "zh": "東山",
        "en": "Higashiyama"
    },
    "东山区": {
        "zh": "东山区",
        "en": "Higashiyama Ward"
    },
    "吉州": {
        "zh": "吉州",
        "en": "Jizhou"
    },
    "南平": {
        "zh": "南平",
        "en": "Nanping"
    },
    "北區": {
        "zh": "北區",
        "en": "North District"
    },
    "千代田": {
        "zh": "千代田",
        "en": "Chiyoda"
    },
    "浙江": {
        "zh": "浙江",
        "en": "Zhejiang"
    },
    "鎌倉": {
        "zh": "鎌倉",
        "en": "Kamakura"
    },
    "張家港": {
        "zh": "張家港",
        "en": "Zhangjiagang"
    },
    "神奈川": {
        "zh": "神奈川",
        "en": "Kanagawa"
    },
    "相國寺": {
        "zh": "相國寺",
        "en": "Prime Temple"
    },
    "揚州": {
        "zh": "揚州",
        "en": "Yangzhou"
    },
    "北京": {
        "zh": "北京",
        "en": "Beijing"
    },
    "八幡": {
        "zh": "八幡",
        "en": "Yawata"
    },
    "當塗": {
        "zh": "當塗",
        "en": "Dangtu"
    },
    "上京": {
        "zh": "上京",
        "en": "Kamikyo"
    },
    "坡平": {
        "zh": "坡平",
        "en": "Pyeong"
    },
    "天津": {
        "zh": "天津",
        "en": "Tianjin"
    },
    "江西": {
        "zh": "江西",
        "en": "Jiangxi"
    },
    "河北": {
        "zh": "河北",
        "en": "Hebei"
    },
    "南昌": {
        "zh": "南昌",
        "en": "Nanchang"
    },
    "日本": {
        "zh": "日本",
        "en": "Japan"
    },
    "贛州": {
        "zh": "贛州",
        "en": "Ganzhou"
    },
    "紅葉山": {
        "zh": "紅葉山",
        "en": "Kaya Hill"
    },
    "東京": {
        "zh": "東京",
        "en": "Tokyo"
    },
    "吉安": {
        "zh": "吉安",
        "en": "Ji'an"
    },
    "建甌": {
        "zh": "建甌",
        "en": "Jian'ou"
    },
    "中心皇宮內舊御府圖書館": {
        "zh": "中心皇宮內舊御府圖書館",
        "en": "Central Imperial Palace Old Imperial Palace Library"
    },
    "上海": {
        "zh": "上海",
        "en": "Shanghai"
    },
    "安康": {
        "zh": "安康",
        "en": "Ankang"
    },
    "成都": {
        "zh": "成都",
        "en": "Chengdu"
    },
    "青浦": {
        "zh": "青浦",
        "en": "Qingpu"
    },
    "福井": {
        "zh": "福井",
        "en": "Fukui"
    },
    "鹿兒島": {
        "zh": "鹿兒島",
        "en": "Kagoshima"
    },
    "江南": {
        "zh": "江南",
        "en": "Jiangnan"
    },
    "蘇州": {
        "zh": "蘇州",
        "en": "Suzhou"
    },
    "滋賀": {
        "zh": "滋賀",
        "en": "Shiga"
    },
    "右京": {
        "zh": "右京",
        "en": "Yukyo"
    },
    "港區": {
        "zh": "港區",
        "en": "Port Ward"
    },
    "江蘇": {
        "zh": "江蘇",
        "en": "Jiangsu"
    },
    "台東": {
        "zh": "台東",
        "en": "Taidong"
    },
    "湖北": {
        "zh": "湖北",
        "en": "Hubei"
    },
    "建瓯": {
        "zh": "建瓯",
        "en": "Jianou"
    },
    "豐島": {
        "zh": "豐島",
        "en": "Toshima"
    },
    "佐伯": {
        "zh": "佐伯",
        "en": "Zabe"
    },
    "崑山": {
        "zh": "崑山",
        "en": "Kunshan"
    },
    "陝西": {
        "zh": "陝西",
        "en": "Shaanxi"
    },
    "長春": {
        "zh": "長春",
        "en": "Changchun"
    },
    "紹興": {
        "zh": "紹興",
        "en": "Shaoxing"
    },
    "開城市": {
        "zh": "開城市",
        "en": "Kaesong"
    },
    "韓國": {
        "zh": "韓國",
        "en": "South Korea"
    },
    "建陽": {
        "zh": "建陽",
        "en": "Jianyang"
    },
    "橫濱": {
        "zh": "橫濱",
        "en": "Yokohama"
    },
    "臺東": {
        "zh": "臺東",
        "en": "Taitung"
    },
    "金澤町": {
        "zh": "金澤町",
        "en": "Kanazawa"
    },
    "北堀町": {
        "zh": "北堀町",
        "en": "Kitahori Machi"
    },
    "上野公園北": {
        "zh": "上野公園北",
        "en": "Ueno Park North"
    },
    "北之丸公園": {
        "zh": "北之丸公園",
        "en": "Kitamaru Park"
    },
    "麻沙鎮": {
        "zh": "麻沙鎮",
        "en": "Masha town"
    },
    "上野": {
        "zh": "上野",
        "en": "Ueno"
    },
    "嵯峨": {
        "zh": "嵯峨",
        "en": "ridge"
    },
    "金澤": {
        "zh": "金澤",
        "en": "Kanazawa"
    },
    "赤坂離宮": {
        "zh": "赤坂離宮",
        "en": "Akasaka Isomiya"
    },
    "本町": {
        "zh": "本町",
        "en": "Motomachi"
    },
    "湯島": {
        "zh": "湯島",
        "en": "Yujima"
    },
    "戶塚": {
        "zh": "戶塚",
        "en": "Tozuka"
    },
    "日野町": {
        "zh": "日野町",
        "en": "Hino machi"
    },
    "安福": {
        "zh": "安福",
        "en": "Anfu"
    },
    "南禪寺": {
        "zh": "南禪寺",
        "en": "Nanzen Temple"
    },
    "神田佐九間町": {
        "zh": "神田佐九間町",
        "en": "Sakuma Kanda"
    },
    "霞关": {
        "zh": "霞关",
        "en": "Kasumigaseki"
    },
    "西湖": {
        "zh": "西湖",
        "en": "West Lake"
    },
    "皇居": {
        "zh": "皇居",
        "en": "Imperial residence"
    },
    "藏前町": {
        "zh": "藏前町",
        "en": "Ashiemachi"
    }
}

export const book_name_lang = {
    "詩童子問二十卷": {
        "zh": "詩童子問二十卷",
        "en": "The poet asked the twenty volumes"
    },
    "重廣分門三蘇先生文粹": {
        "zh": "重廣分門三蘇先生文粹",
        "en": "Heavy wide division of three Su Mr. Cultural essence"
    },
    "王荊文公詩": {
        "zh": "王荊文公詩",
        "en": "The poems of Wang Jing and Wen Gong"
    },
    "附音傍訓晦庵論語句解二卷": {
        "zh": "附音傍訓晦庵論語句解二卷",
        "en": "Attached to the sound of Xun Hanguan analects sentence solution two volumes"
    },
    "中州集": {
        "zh": "中州集",
        "en": "Zhongzhou collection"
    },
    "諸病源候論": {
        "zh": "諸病源候論",
        "en": "On the pathogenesis of various diseases"
    },
    "文中子中說": {
        "zh": "文中子中說",
        "en": "The article said"
    },
    "村西集": {
        "zh": "村西集",
        "en": "Cun Xiji"
    },
    "東坡集": {
        "zh": "東坡集",
        "en": "Dongpo collection"
    },
    "四書輯釋": {
        "zh": "四書輯釋",
        "en": "The four books are released"
    },
    "正法眼藏": {
        "zh": "正法眼藏",
        "en": "The right way is hidden in the eyes"
    },
    "史記": {
        "zh": "史記",
        "en": "Historical records"
    },
    "集韻": {
        "zh": "集韻",
        "en": "Collection of rhyme"
    },
    "游宦紀聞": {
        "zh": "游宦紀聞",
        "en": "You eunuch chronicle"
    },
    "集千家註分類杜工部詩": {
        "zh": "集千家註分類杜工部詩",
        "en": "Collection of thousands of notes classification Du Gongbu poetry"
    },
    "新編排韻增廣事類氏族大全": {
        "zh": "新編排韻增廣事類氏族大全",
        "en": "New arrangement of rhyme to increase the matter of clan completions"
    },
    "詩緝三十六卷": {
        "zh": "詩緝三十六卷",
        "en": "Poetry volume 36"
    },
    "十七史詳節": {
        "zh": "十七史詳節",
        "en": "Seventeen sections of history"
    },
    "呂氏家塾讀詩記": {
        "zh": "呂氏家塾讀詩記",
        "en": "Lu's family school read poetry"
    },
    "程朱二先生周易傳義": {
        "zh": "程朱二先生周易傳義",
        "en": "Mr. Cheng, Zhu and Zhou Yi preached righteousness"
    },
    "太平寰宇記": {
        "zh": "太平寰宇記",
        "en": "Taiping World Book"
    },
    "王文公文集": {
        "zh": "王文公文集",
        "en": "The collected works of Wang Wengong"
    },
    "文選（明州本）": {
        "zh": "文選（明州本）",
        "en": "Selected texts (Mingzhou Edition)"
    },
    "孝經": {
        "zh": "孝經",
        "en": "Filial piety sutra"
    },
    "楊氏家藏方": {
        "zh": "楊氏家藏方",
        "en": "Yang's family Tibetan prescription"
    },
    "論語注疏": {
        "zh": "論語注疏",
        "en": "The Analects of Confucius"
    },
    "故唐律疏議名例篇": {
        "zh": "故唐律疏議名例篇",
        "en": "Therefore, the Tang Dynasty law sparsely discussed famous examples"
    },
    "崔舍人玉堂類稿": {
        "zh": "崔舍人玉堂類稿",
        "en": "Cui Sheren jade Hall class manuscript"
    },
    "周易本义附錄集註十卷": {
        "zh": "周易本义附錄集註十卷",
        "en": "Zhouyi original meaning Appendix notes ten volumes"
    },
    "春秋胡氏傳附錄纂疏": {
        "zh": "春秋胡氏傳附錄纂疏",
        "en": "The Spring and Autumn Hu appendix is sparse"
    },
    "歐陽文忠公集": {
        "zh": "歐陽文忠公集",
        "en": "Ouyang Wenzhong Gongji"
    },
    "禪林類聚": {
        "zh": "禪林類聚",
        "en": "Zen forest together"
    },
    "新編四六必用方與勝覽": {
        "zh": "新編四六必用方與勝覽",
        "en": "The new 46 will use Fang and Sheng Shan"
    },
    "論衡": {
        "zh": "論衡",
        "en": "On balance"
    },
    "北礀集": {
        "zh": "北礀集",
        "en": "Beiqiji"
    },
    "聯燈會要": {
        "zh": "聯燈會要",
        "en": "The lights will be"
    },
    "增廣太平惠民和劑局方": {
        "zh": "增廣太平惠民和劑局方",
        "en": "Enlarge Taiping benefit people and drug bureau side"
    },
    "古今韻會舉要": {
        "zh": "古今韻會舉要",
        "en": "Ancient and modern rhyme will mention"
    },
    "誠齋四六發遣膏馥": {
        "zh": "誠齋四六發遣膏馥",
        "en": "Cheng Zhai four six hair send ointment Fu"
    },
    "景文宋公集": {
        "zh": "景文宋公集",
        "en": "Jingwen Song Gong set"
    },
    "太平御覽": {
        "zh": "太平御覽",
        "en": "Peaceful view"
    },
    "詩集傳音釋": {
        "zh": "詩集傳音釋",
        "en": "A collection of poems is translated"
    },
    "天台陳先生類編花果卉木全芳備祖": {
        "zh": "天台陳先生類編花果卉木全芳備祖",
        "en": "Rooftop Mr. Chen type braid flowers and flowers wood full aromatic prepared ancestor"
    },
    "四書章圖纂釋": {
        "zh": "四書章圖纂釋",
        "en": "The four books and chapters of the map compilation"
    },
    "寒山詩集": {
        "zh": "寒山詩集",
        "en": "Hanshan poetry collection"
    },
    "本草衍義": {
        "zh": "本草衍義",
        "en": "The implication of materia medica"
    },
    "禮記集說": {
        "zh": "禮記集說",
        "en": "The book of Rites says"
    },
    "魏氏家藏方": {
        "zh": "魏氏家藏方",
        "en": "Wei's family Tibetan prescriptions"
    },
    "尚書正義": {
        "zh": "尚書正義",
        "en": "Justice of the book"
    },
    "纂圖增新群書類要類事林廣記": {
        "zh": "纂圖增新群書類要類事林廣記",
        "en": "The compilation of new books to add to the class of things in the broad records"
    },
    "春秋諸傳會通": {
        "zh": "春秋諸傳會通",
        "en": "The Spring and Autumn generations will pass through"
    },
    "爾雅注疏": {
        "zh": "爾雅注疏",
        "en": "A surname"
    },
    "初學記": {
        "zh": "初學記",
        "en": "Beginner's record"
    },
    "通典": {
        "zh": "通典",
        "en": "General code"
    },
    "世說新語": {
        "zh": "世說新語",
        "en": "The world speaks a new language"
    },
    "文選（贛州本）": {
        "zh": "文選（贛州本）",
        "en": "Selected Texts (Ganzhou version)"
    },
    "新編類要圖註本草": {
        "zh": "新編類要圖註本草",
        "en": "The new class diagram notes materia medica"
    },
    "西翁近藁": {
        "zh": "西翁近藁",
        "en": "Scion chinensis"
    },
    "大方廣佛華嚴經": {
        "zh": "大方廣佛華嚴經",
        "en": "Generous and broad Buddha and strict sutras"
    },
    "誠齋先生南海集": {
        "zh": "誠齋先生南海集",
        "en": "Mr. Seizai Nanhai Collection"
    },
    "春秋經傳集解三十卷": {
        "zh": "春秋經傳集解三十卷",
        "en": "The Spring and Autumn classics collected 30 volumes"
    },
    "國朝文類": {
        "zh": "國朝文類",
        "en": "Chinese and Korean characters"
    },
    "誠齋集": {
        "zh": "誠齋集",
        "en": "Seisaiji"
    },
    "禪宗頌古聯珠通集": {
        "zh": "禪宗頌古聯珠通集",
        "en": "Zen song ancient Lianzhu Tong set"
    }
}

export const agent_trans_name = {
    "掘正意": {
        "zh": "掘正意",
        "en": "Jue Zhengyi"
    },
    "釋宗杲": {
        "zh": "釋宗杲",
        "en": "Shi Zonggao"
    },
    "寺田弘(一名盛業，字士弘，號望南)": {
        "zh": "寺田弘(一名盛業，字士弘，號望南)",
        "en": "Hiroshi Terada (a Seigyo, courtesy name Shiko, alias Bonan)"
    },
    "寺田弘": {
        "zh": "寺田弘",
        "en": "Hiroshi Terada"
    },
    "蘇軾": {
        "zh": "蘇軾",
        "en": "Su Shi"
    },
    "沢田一斎": {
        "zh": "沢田一斎",
        "en": "Issai Sawada"
    },
    "宋祁": {
        "zh": "宋祁",
        "en": "Song Qi"
    },
    "巢元方": {
        "zh": "巢元方",
        "en": "Neiyuan formula"
    },
    "朱熹/程復心": {
        "zh": "朱熹/程復心",
        "en": "Zhu Xi/Cheng Fuxin"
    },
    "僧玄興": {
        "zh": "僧玄興",
        "en": "Monk Xuanxing"
    },
    "德富蘇峰": {
        "zh": "德富蘇峰",
        "en": "Soho Tokutomi"
    },
    "菅原在輔": {
        "zh": "菅原在輔",
        "en": "Arisuke Sugawara"
    },
    "小倉祐利": {
        "zh": "小倉祐利",
        "en": "Yuri Ogura"
    },
    "寶英": {
        "zh": "寶英",
        "en": "Baoying"
    },
    "丹波氏(即多紀氏，多紀元孝等)": {
        "zh": "丹波氏(即多紀氏，多紀元孝等)",
        "en": "Tanba (i.e. Taki, Mototaka Taki, etc.)"
    },
    // addtion
    "丹波氏": {
        "zh": "丹波氏",
        "en": "Tanba etc."
    },
    "蕭統/李善/五臣（呂延濟、劉良、張銑、呂向、李周瀚）": {
        "zh": "蕭統/李善/五臣（呂延濟、劉良、張銑、呂向、李周瀚）",
        "en": "Xiao Tong/LI Shan/Wu Chen (LV Yanji, Liu Liang, Zhang Mill, Lu Xiang, LI Zhouhan)"
    },
    // addition
    "蕭統（等）": {
        "zh": "蕭統（等）",
        "en": "Xiao Tong etc."
    },
    "陳景沂/祝穆": {
        "zh": "陳景沂/祝穆",
        "en": "Chen Jingyi/Zhu Mu"
    },
    "丁度": {
        "zh": "丁度",
        "en": "Butyl degree"
    },
    "釋悟明": {
        "zh": "釋悟明",
        "en": "enlightenment"
    },
    "圓種": {
        "zh": "圓種",
        "en": "Round species"
    },
    "愛新覺羅顒琰、旻宁、奕詝、载淳、载湉、溥仪": {
        "zh": "愛新覺羅顒琰、旻宁、奕詝、载淳、载湉、溥仪",
        "en": "Aisin Jogoro, Minning, Yi wisdom, Jaisun, Jaishu, Pu Yi"
    },
    // addition
    "愛新覺羅顒琰（等）": {
        "zh": "愛新覺羅顒琰（等）",
        "en": "Aisin Jogoro etc."
    },
    "李昉": {
        "zh": "李昉",
        "en": "Li Fang"
    },
    "岡本況齋": {
        "zh": "岡本況齋",
        "en": "Kyosai Okamoto"
    },
    "王安石": {
        "zh": "王安石",
        "en": "Wang Anshi"
    },
    "高麗肅宗": {
        "zh": "高麗肅宗",
        "en": "King Sukjong of Goryeo"
    },
    "真勢中洲": {
        "zh": "真勢中洲",
        "en": "Chusyu Mase"
    },
    "聖一國師": {
        "zh": "聖一國師",
        "en": "Syoichi-kokushi"
    },
    "市橋長昭": {
        "zh": "市橋長昭",
        "en": "Nagaaki Ichihashi"
    },
    "陳澔": {
        "zh": "陳澔",
        "en": "Chen ho"
    },
    "寺田望南": {
        "zh": "寺田望南",
        "en": "Terada Bonan"
    },
    "毛利高翰": {
        "zh": "毛利高翰",
        "en": "Takanaka Mori"
    },
    "柴邦彥": {
        "zh": "柴邦彥",
        "en": "Kunihiko Shiba"
    },
    "寒山": {
        "zh": "寒山",
        "en": "Cold mountain"
    },
    "王安石/李壁/劉辰翁": {
        "zh": "王安石/李壁/劉辰翁",
        "en": "Wang Anshi/Li Bi/Liu Chenweng"
    },
    // addition
    "王安石（等）": {
        "zh": "王安石（等）",
        "en": "Wang Anshi etc."
    },
    "杜甫/徐居仁/黃鶴": {
        "zh": "杜甫/徐居仁/黃鶴",
        "en": "Du Fu/Xu Juren/Huang He"
    },
    // addtion
    "杜甫（等）": {
        "zh": "杜甫（等）",
        "en": "Du Fu etc."
    },
    "劉渙": {
        "zh": "劉渙",
        "en": "Liu Huan"
    },
    "許謙": {
        "zh": "許謙",
        "en": "Xu Qian"
    },
    "范履祥": {
        "zh": "范履祥",
        "en": "Fan Luxiang"
    },
    "毋逢辰": {
        "zh": "毋逢辰",
        "en": "Wu Fengchen"
    },
    "林恕": {
        "zh": "林恕",
        "en": "Lin Shu"
    },
    "清田儋叟": {
        "zh": "清田儋叟",
        "en": "Tanso Seita"
    },
    "多紀元德": {
        "zh": "多紀元德",
        "en": "Motonori Taki"
    },
    "森立之": {
        "zh": "森立之",
        "en": "Risshi Mori"
    },
    "實叉難陀": {
        "zh": "實叉難陀",
        "en": "Shiharnanda"
    },
    "董楷": {
        "zh": "董楷",
        "en": "Dong Kai"
    },
    "狩谷棭齋": {
        "zh": "狩谷棭齋",
        "en": "Ekisai Kariya"
    },
    "溥傑": {
        "zh": "溥傑",
        "en": "Pu Jie"
    },
    "山田業廣": {
        "zh": "山田業廣",
        "en": "Gyoko Yamada"
    },
    "朝鮮世宗": {
        "zh": "朝鮮世宗",
        "en": "Joseon Sejong"
    },
    "陳元靚": {
        "zh": "陳元靚",
        "en": "Chen Yuanliang"
    },
    "呂祖謙": {
        "zh": "呂祖謙",
        "en": "Lv Zuqian"
    },
    "祝穆": {
        "zh": "祝穆",
        "en": "Zhu Mu"
    },
    "孔穎達/王德韶/李子雲/朱長才/蘇德融/隋德素/王士雄/趙弘智/長孫無忌/李勣/于志寧/張行成/高季輔/褚遂良/柳奭/谷那律/劉伯莊/賈公彥/范義頵/齊威/柳士宣/孔志約/趙君贊/薛伯珍/史士弘/鄭祖玄/周玄達/李玄植/王真儒": {
        "zh": "孔穎達/王德韶/李子雲/朱長才/蘇德融/隋德素/王士雄/趙弘智/長孫無忌/李勣/于志寧/張行成/高季輔/褚遂良/柳奭/谷那律/劉伯莊/賈公彥/范義頵/齊威/柳士宣/孔志約/趙君贊/薛伯珍/史士弘/鄭祖玄/周玄達/李玄植/王真儒",
        "en": "Kong Yingda/Wang Deshao/Li Ziyun/Zhu Changcai/Su Delong/Sui Desu/Wang Shixiong/Zhao Hongzhi/Changsun Wuji/Li Merit/Yu Zhining/Zhang Xingcheng/Gao Jifu/Chu Suiliang/Liu Shi/Gu Nalu/Liu Bozhuang/Jia Gongyan/Fan Yishuang/Qi Wei/Liu Shixuan/Kong Zhiyao/Zhao Junzan/Xue Bozhen/Shi Shihong/Zheng Zuxuan/Zhou Xuanda/Li Xuanshik/Wang Zhenru"
    },
    // addition
    "孔穎達（等）": {
        "zh": "孔穎達（等）",
        "en": "Kong Yingda etc."
    },
    "李公凱": {
        "zh": "李公凱",
        "en": "Li Gongkai"
    },
    "張清子": {
        "zh": "張清子",
        "en": "Zhang Qingzi"
    },
    "井口蘭雪": {
        "zh": "井口蘭雪",
        "en": "Ransetsu Iguchi"
    },
    "歐陽修": {
        "zh": "歐陽修",
        "en": "Ouyang Xiu"
    },
    "顧然": {
        "zh": "顧然",
        "en": "Gu Ran"
    },
    "溥儀/溥傑": {
        "zh": "溥儀/溥傑",
        "en": "Pu Yi/Pu Jie"
    },
    "寇宗奭": {
        "zh": "寇宗奭",
        "en": "Kou Zongshi"
    },
    "樂史": {
        "zh": "樂史",
        "en": "Leshi"
    },
    "彭寅翁": {
        "zh": "彭寅翁",
        "en": "Peng Yin Weng"
    },
    "河合元升": {
        "zh": "河合元升",
        "en": "Gensyo Kawai"
    },
    "毛利高標": {
        "zh": "毛利高標",
        "en": "Takasue Mori"
    },
    "余彥國": {
        "zh": "余彥國",
        "en": "Yu Yanguo"
    },
    "宇喜多秀家": {
        "zh": "宇喜多秀家",
        "en": "Hideie Ukita"
    },
    "德川家齊": {
        "zh": "德川家齊",
        "en": "Ienari Tokugawa"
    },
    "愛新覺羅弘曆": {
        "zh": "愛新覺羅弘曆",
        "en": "Aixinjueluo Hongli"
    },
    "王通/阮逸": {
        "zh": "王通/阮逸",
        "en": "Wang Tong/Ruan Yi"
    },
    "陳齊巖": {
        "zh": "陳齊巖",
        "en": "Chen Qiyan"
    },
    "納蘭揆敘": {
        "zh": "納蘭揆敘",
        "en": "Naran Cosur"
    },
    "余志安": {
        "zh": "余志安",
        "en": "Yu Zhi 'an"
    },
    "吳岫": {
        "zh": "吳岫",
        "en": "Wu Xiu"
    },
    "樋口光義": {
        "zh": "樋口光義",
        "en": "Mitsuyoshi Higuchi"
    },
    "真定提學龍山趙候國寶": {
        "zh": "真定提學龍山趙候國寶",
        "en": "Really set learning Longshan Zhao Hou national treasure"
    },
    "狩谷望之": {
        "zh": "狩谷望之",
        "en": "Mochiyuki Kariya"
    },
    "魏峴": {
        "zh": "魏峴",
        "en": "Wei Xian"
    },
    "芝野六助": {
        "zh": "芝野六助",
        "en": "Rokusuke Shibano"
    },
    "細川十洲(潤次郎)": {
        "zh": "細川十洲(潤次郎)",
        "en": "Hosokawa Jyussyu (Jyunjiro)"
    },
    // addtion
    "細川十洲": {
        "zh": "細川十洲",
        "en": "Hosokawa Jyussyu"
    },
    "譚景星/陳泗孔": {
        "zh": "譚景星/陳泗孔",
        "en": "Tan Jingxing/Chen Sikong"
    },
    "溥儀/日本天皇": {
        "zh": "溥儀/日本天皇",
        "en": "Pu Yi/The Emperor of Japan"
    },
    "多紀元孝": {
        "zh": "多紀元孝",
        "en": "Mototaka Taki"
    },
    "趙善繼/盧欽": {
        "zh": "趙善繼/盧欽",
        "en": "Zhao Shanji/Lu Qin"
    },
    "王充": {
        "zh": "王充",
        "en": "Wang Chong"
    },
    "張世南": {
        "zh": "張世南",
        "en": "Zhang Shinan"
    },
    "蘇天爵": {
        "zh": "蘇天爵",
        "en": "Su Tianjue"
    },
    "蘇洵/蘇軾/蘇轍/闕名": {
        "zh": "蘇洵/蘇軾/蘇轍/闕名",
        "en": "Su Xun/Su Shi/Su Zhe/Que name"
    },
    // addtion
    "蘇洵（等）": {
        "zh": "蘇洵（等）",
        "en": "Su Xun etc."
    },
    "心華元棣": {
        "zh": "心華元棣",
        "en": "Shinge Gentei"
    },
    "曲直瀨養安院家": {
        "zh": "曲直瀨養安院家",
        "en": "Manase-yoanin"
    },
    "唐寅": {
        "zh": "唐寅",
        "en": "Tang Yin"
    },
    "倪士毅": {
        "zh": "倪士毅",
        "en": "Ni Shiyi"
    },
    "林衡": {
        "zh": "林衡",
        "en": "Lin Heng"
    },
    "崔敦诗": {
        "zh": "崔敦诗",
        "en": "Choi Dunshi"
    },
    "郭璞/邢昺": {
        "zh": "郭璞/邢昺",
        "en": "Guo Pu/Xing Bing"
    },
    "邢昺": {
        "zh": "邢昺",
        "en": "Xing Bing"
    },
    "堀正意": {
        "zh": "堀正意",
        "en": "Masaoki Hori"
    },
    "山内豊信": {
        "zh": "山内豊信",
        "en": "Toyoshige Yamauchi"
    },
    "錢孫愛": {
        "zh": "錢孫愛",
        "en": "Qian Sunai"
    },
    "釋居簡": {
        "zh": "釋居簡",
        "en": "A surname"
    },
    "日典": {
        "zh": "日典",
        "en": "Nitten"
    },
    "木村正辭": {
        "zh": "木村正辭",
        "en": "Masakoto Kimura"
    },
    "渡邊霞亭": {
        "zh": "渡邊霞亭",
        "en": "Katei Watanabe"
    },
    "楊倓": {
        "zh": "楊倓",
        "en": "Yang Yan"
    },
    "尹瑜": {
        "zh": "尹瑜",
        "en": "Yin Yu"
    },
    "江戶幕府": {
        "zh": "江戶幕府",
        "en": "The Edo shogunate"
    },
    "榊原玄輔": {
        "zh": "榊原玄輔",
        "en": "Gensuke Sakakibara"
    },
    "伊勢屋源七": {
        "zh": "伊勢屋源七",
        "en": "Iseya Genshichi"
    },
    "林宗二": {
        "zh": "林宗二",
        "en": "Rin Soji"
    },
    "汪克寬": {
        "zh": "汪克寬",
        "en": "Wang Kekuan"
    },
    "李隆基": {
        "zh": "李隆基",
        "en": "Li Longji"
    },
    "汪啟淑": {
        "zh": "汪啟淑",
        "en": "Wang Qishu"
    },
    "多紀元簡": {
        "zh": "多紀元簡",
        "en": "Motoyasu Taki"
    },
    "洪适": {
        "zh": "洪适",
        "en": "Hong Shi"
    },
    "黃公紹/熊忠": {
        "zh": "黃公紹/熊忠",
        "en": "Huang Gongshao/Xiong Zhong"
    },
    "李濂": {
        "zh": "李濂",
        "en": "Li Lian"
    },
    "劉義慶/劉孝標": {
        "zh": "劉義慶/劉孝標",
        "en": "Liu Yiqing/Liu Xiaobiao"
    },
    "楊萬里/周公恕": {
        "zh": "楊萬里/周公恕",
        "en": "Yang Wanli/Zhou Gongshu"
    },
    "木村蒹葭堂": {
        "zh": "木村蒹葭堂",
        "en": "Kenkado Kimura"
    },
    "釋道泰/智境": {
        "zh": "釋道泰/智境",
        "en": "Shi Tao Tai/Zhi Jing"
    },
    "陳師文": {
        "zh": "陳師文",
        "en": "Chen Shiwen"
    },
    "館機(名機，字樞卿)": {
        "zh": "館機(名機，字樞卿)",
        "en": "Pavilion machine (first name machine, Chinese character Shuqing)"
    },
    // addtiion
    "館機": {
        "zh": "館機",
        "en": "Pavilion machine"
    },
    "無學祖元": {
        "zh": "無學祖元",
        "en": "Mugaku Sogen"
    },
    "聞人模": {
        "zh": "聞人模",
        "en": "Human model"
    },
    "新見正路": {
        "zh": "新見正路",
        "en": "Shinmi Masamichi"
    },
    "杜佑": {
        "zh": "杜佑",
        "en": "Du You"
    },
    "上杉憲實": {
        "zh": "上杉憲實",
        "en": "Norizane Uesugi"
    },
    "徐堅": {
        "zh": "徐堅",
        "en": "Xu Jian"
    },
    "楊萬里/楊長儒/羅茂良": {
        "zh": "楊萬里/楊長儒/羅茂良",
        "en": "Yang Wanli/Yang Changru/Luo Maoliang"
    },
    // addtion
    "楊萬里（等）": {
        "zh": "楊萬里（等）",
        "en": "Yang Wanli etc."
    },
    "釋法應/釋普惠": {
        "zh": "釋法應/釋普惠",
        "en": "The interpretation of the Fa should be/the interpretation of the Pu Hui"
    },
    "余四十三郎": {
        "zh": "余四十三郎",
        "en": "Yu 43 lang"
    },
    "長孫無忌": {
        "zh": "長孫無忌",
        "en": "Eldest son Wuji"
    },
    "--": {
        "zh": "--",
        "en": "--"
    }
}

export const library_trans_name = {
    "--": {
        "zh": "--",
        "en": "--"
    },
    "國立公文書館": {
        "zh": "國立公文書館",
        "en": "National Public Library"
    },
    "宮内省圖書寮": {
        "zh": "宮内省圖書寮",
        "en": "The Tosyoryo Bunko of Imperial Household Agency"
    },
    "宮内廳書陵部": {
        "zh": "宮内廳書陵部",
        "en": "The Syoryobu Department of Imperial Household Agency"
    },
    "圓德寺": {
        "zh": "圓德寺",
        "en": "Entokuji Temple"
    },
    "日本舊御府圖書館": {
        "zh": "日本舊御府圖書館",
        "en": "The Old Imperial Palace Library in Japan"
    },
    "妙心寺": {
        "zh": "妙心寺",
        "en": "Myoshinji Temple"
    },
    "勤有堂": {
        "zh": "勤有堂",
        "en": "Qin Yutang"
    },
    "清宮内府": {
        "zh": "清宮内府",
        "en": "The imperial Palace"
    },
    "不二北軒": {
        "zh": "不二北軒",
        "en": "North Fuji-an"
    },
    "御府圖書": {
        "zh": "御府圖書",
        "en": "Imperial house book"
    },
    "無範": {
        "zh": "無範",
        "en": "Muhan"
    },
    "大學校": {
        "zh": "大學校",
        "en": "university"
    },
    "大學": {
        "zh": "大學",
        "en": "university"
    },
    "大學校/大學": {
        "zh": "大學校/大學",
        "en": "A large school/university"
    },
    "趨古齋": {
        "zh": "趨古齋",
        "en": "Ancient zhai"
    },
    "佐伯藩": {
        "zh": "佐伯藩",
        "en": "Saiki Han"
    },
    "稱名寺": {
        "zh": "稱名寺",
        "en": "Syomyoji Temple"
    },
    "德川幕府": {
        "zh": "德川幕府",
        "en": "The Tokugawa shogunate"
    },
    "心華藏書": {
        "zh": "心華藏書",
        "en": "The collection of Shinge Gentei"
    },
    "日本政府圖書": {
        "zh": "日本政府圖書",
        "en": "Books of Japanese government"
    },
    "全谿義塾": {
        "zh": "全谿義塾",
        "en": "Jeon Kye Juku"
    },
    "内閣文庫": {
        "zh": "内閣文庫",
        "en": "Naikoku Bunko"
    },
    "崇道精舍": {
        "zh": "崇道精舍",
        "en": "Chongdao Jing House"
    },
    "艮岳院": {
        "zh": "艮岳院",
        "en": "Kongaku-in"
    },
    "相國寺": {
        "zh": "相國寺",
        "en": "Syokokuji Temple"
    },
    "圓覺寺塔中歸源院": {
        "zh": "圓覺寺塔中歸源院",
        "en": "Kigenin，Tattyu of Engakuji Temple"
    },
    "内務省文庫": {
        "zh": "内務省文庫",
        "en": "Library of Home Ministry"
    },
    "圓覺寺": {
        "zh": "圓覺寺",
        "en": "Engakuji Temple"
    },
    "芳春院": {
        "zh": "芳春院",
        "en": "Housyunin"
    },
    "懷仙樓": {
        "zh": "懷仙樓",
        "en": "Huai Xian Lou"
    },
    "建依別文庫": {
        "zh": "建依別文庫",
        "en": "Takeyoriwake Bunko"
    },
    "楓山文庫": {
        "zh": "楓山文庫",
        "en": "Momijiyama Bunko"
    },
    "聿修堂": {
        "zh": "聿修堂",
        "en": "Issyudo"
    },
    "宮内省書陵部": {
        "zh": "宮内省書陵部",
        "en": "The Syoryobu Department of Imperial Household Agency"
    },
    "醫學館": {
        "zh": "醫學館",
        "en": "Igakukan"
    },
    "京都高山寺": {
        "zh": "京都高山寺",
        "en": "Kouzanji Temple，Kyoto"
    },
    "江戶醫學館(初名“躋壽館”)": {
        "zh": "江戶醫學館(初名“躋壽館”)",
        "en": "Edo Igakukan (original name \"Seijyukan\")"
    },
    "江戶醫學館": {
        "zh": "江戶醫學館",
        "en": "Edo Igakukan"
    },
    "京都學校": {
        "zh": "京都學校",
        "en": "Kyoto school"
    },
    "京都妙覺寺": {
        "zh": "京都妙覺寺",
        "en": "Myokakuji Temple，Kyoto"
    },
    "顏氏家藏": {
        "zh": "顏氏家藏",
        "en": "The Yan family stash"
    },
    "桂宮文庫": {
        "zh": "桂宮文庫",
        "en": "Katsuranomiya Bunko"
    },
    "讀杜草堂/靜節山房": {
        "zh": "讀杜草堂/靜節山房",
        "en": "Read Du cottage/static section mountain room"
    },
    "文化辛未": {
        "zh": "文化辛未",
        "en": "Bunka Xinwei"
    },
    "躋壽館": {
        "zh": "躋壽館",
        "en": "Seijyukan"
    },
    "享和壬戌": {
        "zh": "享和壬戌",
        "en": "Kyowa Renxu"
    },
    "北玉照齋": {
        "zh": "北玉照齋",
        "en": "North Jade Light Zhai"
    },
    "興國軍": {
        "zh": "興國軍",
        "en": "Xingguo army"
    },
    "金澤文庫": {
        "zh": "金澤文庫",
        "en": "Kanazawa Bunko"
    },
    "幕府?": {
        "zh": "幕府?",
        "en": "The shogunate?"
    },
    "真定": {
        "zh": "真定",
        "en": "genidine"
    },
    "黃雪書屋": {
        "zh": "黃雪書屋",
        "en": "Kosetsu syooku"
    },
    "霞亭": {
        "zh": "霞亭",
        "en": "Katei"
    },
    "學習院": {
        "zh": "學習院",
        "en": "Gakusyuin"
    },
    "龍眠庵": {
        "zh": "龍眠庵",
        "en": "Ryumin-an"
    },
    "普門院": {
        "zh": "普門院",
        "en": "Fumonin"
    },
    "南禪寺金地院": {
        "zh": "南禪寺金地院",
        "en": "Konchiin in Nanzenji Temple"
    },
    "謙牧堂": {
        "zh": "謙牧堂",
        "en": "Chamomido"
    },
    "廣壽院": {
        "zh": "廣壽院",
        "en": "Kojyuin"
    },
    "狩谷棭齋求古樓": {
        "zh": "狩谷棭齋求古樓",
        "en": "Kyukoro of Kariya Ekisai"
    },
    "金地院": {
        "zh": "金地院",
        "en": "Konchiin"
    },
    "林氏家塾": {
        "zh": "林氏家塾",
        "en": "Rinji kajyuku"
    },
    "淺草文庫": {
        "zh": "淺草文庫",
        "en": "Bunko Asakusa"
    },
    "成簣堂文庫": {
        "zh": "成簣堂文庫",
        "en": "Seikido Bunko"
    },
    "天祿琳瑯": {
        "zh": "天祿琳瑯",
        "en": "The heavens are full of riches"
    },
    "天龍寺鹿王院": {
        "zh": "天龍寺鹿王院",
        "en": "Rokuohin，Tenryuji Temple"
    },
    "戶塚宿": {
        "zh": "戶塚宿",
        "en": "Totsuka juku"
    },
    "翫月堂": {
        "zh": "翫月堂",
        "en": "Gangetsudo"
    },
    "太政官文庫": {
        "zh": "太政官文庫",
        "en": "Dajyokan Bunko"
    },
    "誌書精舍": {
        "zh": "誌書精舍",
        "en": "Zhi Shu Jing House"
    },
    "増上寺恵照院": {
        "zh": "増上寺恵照院",
        "en": "Esyoin in Zoujyoji Temple"
    },
    "楓山官庫": {
        "zh": "楓山官庫",
        "en": "Momijiyama Bunko"
    },
    "昌平坂學問所": {
        "zh": "昌平坂學問所",
        "en": "Syoheizaka gakumonjyo"
    },
    "神宮寺": {
        "zh": "神宮寺",
        "en": "Jinguji"
    },
    "寶勝院": {
        "zh": "寶勝院",
        "en": "Hosyoin"
    },
    "書籍館": {
        "zh": "書籍館",
        "en": "Syosekikan"
    },
    "玉雲庵 ": {
        "zh": "玉雲庵",
        "en": "Gyokuun-an"
    },
    "内務省": {
        "zh": "内務省",
        "en": "Home Ministry"
    },
    "帝國博物館": {
        "zh": "帝國博物館",
        "en": "Imperial Museum"
    },
    "京都五山南禪寺": {
        "zh": "京都五山南禪寺",
        "en": "Nanzenji Temple in Kyoto Gozan"
    },
    "建安勵賢堂": {
        "zh": "建安勵賢堂",
        "en": "Jianan Lixian Hall"
    },
    "肇慶軍府": {
        "zh": "肇慶軍府",
        "en": "Zhaoqing Jun Fu"
    },
    "天龍寺金剛院": {
        "zh": "天龍寺金剛院",
        "en": "Kongoin，Tenryuji Temple"
    },
    "賜蘆文庫": {
        "zh": "賜蘆文庫",
        "en": "Shiro Bunko"
    },
    "經筵": {
        "zh": "經筵",
        "en": "Longitude feast"
    },
    "暢春堂": {
        "zh": "暢春堂",
        "en": "Chosyundo"
    },
    "植邨書屋": {
        "zh": "植邨書屋",
        "en": "Syokuson syooku"
    },
    "重光殿?": {
        "zh": "重光殿?",
        "en": "The Hall of Heavy Light?"
    },
    "朝鮮李氏王朝王宮": {
        "zh": "朝鮮李氏王朝王宮",
        "en": "Palace of the Lee Dynasty of Korea"
    },
    "紅葉山文庫": {
        "zh": "紅葉山文庫",
        "en": "Momijiyama Bunko"
    }
}

export const book_card_trans = {
    responsible_people: {
        "北宋-邢昺-疏": {
            "zh": "北宋-邢昺-疏",
            "en": "Northern Song Dynasty-Xing Bing-Shu"
        },
        "唐-李善-注/唐-五臣-注": {
            "zh": "唐-李善-注/唐-五臣-注",
            "en": "Tang-Li Shan-Note/Tang-Wu Chen-note"
        },
        "唐-實叉難陀-譯": {
            "zh": "唐-實叉難陀-譯",
            "en": "Tang-sitchfork Nanda-translated"
        },
        "南宋-釋法應-輯集/元-釋普惠-續輯": {
            "zh": "南宋-釋法應-輯集/元-釋普惠-續輯",
            "en": "Southern Song Dynasty-Interpretation of Fa-Compilation/Yuan-Interpretation of Pu Hui-sequel"
        },
        "元-陳澔-撰": {
            "zh": "元-陳澔-撰",
            "en": "Yuan-Chen Ho-Chu"
        },
        "唐-李隆基-注": {
            "zh": "唐-李隆基-注",
            "en": "Tang-Li Longji-Note"
        },
        "晉-郭璞-注/宋-邢昺-疏": {
            "zh": "晉-郭璞-注/宋-邢昺-疏",
            "en": "Jin-Guo Pu-Zhu/Song-Xing Bing-Shu"
        },
        "唐-長孫無忌等-撰": {
            "zh": "唐-長孫無忌等-撰",
            "en": "Written by Tang-Changsun Wuji et al"
        },
        "北宋-寇宗奭-撰": {
            "zh": "北宋-寇宗奭-撰",
            "en": "Northern Song Dynasty-Written by Kou Zongshi"
        },
        "唐-孔穎達-撰/唐-王德韶-撰/唐-李子雲-撰/唐-朱長才-覆審/唐-蘇德融-覆審/唐-隋德素-覆審/唐-王士雄-覆審/唐-趙弘智-覆審/唐-長孫無忌-刊定/唐-李勣-刊定/唐-于志寧-刊定/唐-張行成-刊定/唐-高季輔-刊定/唐-褚遂良-刊定/唐-柳奭-刊定/唐-谷那律-刊定/唐-劉伯莊-刊定/唐-賈公彥-刊定/唐-范義頵-刊定/唐-齊威-刊定/唐-柳士宣-刊定/唐-孔志約-刊定/唐-趙君贊-刊定/唐-薛伯珍-刊定/唐-史士弘-刊定/唐-鄭祖玄-刊定/唐-周玄達-刊定/唐-李玄植-刊定/唐-王真儒-刊定": {
            "zh": "唐-孔穎達-撰/唐-王德韶-撰/唐-李子雲-撰/唐-朱長才-覆審/唐-蘇德融-覆審/唐-隋德素-覆審/唐-王士雄-覆審/唐-趙弘智-覆審/唐-長孫無忌-刊定/唐-李勣-刊定/唐-于志寧-刊定/唐-張行成-刊定/唐-高季輔-刊定/唐-褚遂良-刊定/唐-柳奭-刊定/唐-谷那律-刊定/唐-劉伯莊-刊定/唐-賈公彥-刊定/唐-范義頵-刊定/唐-齊威-刊定/唐-柳士宣-刊定/唐-孔志約-刊定/唐-趙君贊-刊定/唐-薛伯珍-刊定/唐-史士弘-刊定/唐-鄭祖玄-刊定/唐-周玄達-刊定/唐-李玄植-刊定/唐-王真儒-刊定",
            "en": "Tang-Kong Yingda-composed etc."
        },
        "宋-呂祖謙-撰": {
            "zh": "宋-呂祖謙-撰",
            "en": "Song-Lu Zuqian-Written"
        },
        "宋-楊倓-撰": {
            "zh": "宋-楊倓-撰",
            "en": "Song-Yang Yan-written"
        },
        "宋-釋宗杲-撰": {
            "zh": "宋-釋宗杲-撰",
            "en": "Song-Shi Zonggao-Written"
        },
        "宋-朱熹-撰/元-程復心-纂釋": {
            "zh": "宋-朱熹-撰/元-程復心-纂釋",
            "en": "Song-Zhu Xi-Composition/Yuan-Cheng Fuxin-Compilation"
        },
        "元-蘇天爵-編": {
            "zh": "元-蘇天爵-編",
            "en": "Yuan-Su Tianjue-Ed"
        },
        "宋-張世南-撰": {
            "zh": "宋-張世南-撰",
            "en": "Song-Zhang Shi-nan-Written"
        },
        "隋-王通-撰/宋-阮逸-注": {
            "zh": "隋-王通-撰/宋-阮逸-注",
            "en": "Sui-Wang Tong-Chu/Song-Ruan Yi-Note"
        },
        "東漢-王充-撰": {
            "zh": "東漢-王充-撰",
            "en": "Eastern Han Dynasty-Wang Chong-Chu"
        },
        "南朝宋-劉義慶-撰/南朝梁-劉孝標-注": {
            "zh": "南朝宋-劉義慶-撰/南朝梁-劉孝標-注",
            "en": "Southern Song Dynasty-Liu Yiqing-Chu/Southern Liang Dynasty-Liu Xiaobiao-Note"
        },
        "漢-司馬遷-撰/南朝宋-裴駰-集解/唐-司馬貞-索隱/唐-張守節-正義": {
            "zh": "漢-司馬遷-撰/南朝宋-裴駰-集解/唐-司馬貞-索隱/唐-張守節-正義",
            "en": "Han-Sima Qian-Chu/Song-Pei Houn-Jijie/Tang-Sima Zhen-Suoyin/Tang-Zhang Shoujie-Zhengyi"
        },
        "唐-徐堅-撰": {
            "zh": "唐-徐堅-撰",
            "en": "Tang-Xu Jian-Chan"
        },
        "宋-王安石-撰/宋-李壁-箋註/宋-劉辰翁-評點": {
            "zh": "宋-王安石-撰/宋-李壁-箋註/宋-劉辰翁-評點",
            "en": "Song-Wang Anshi-Chu/Song-Li Bi-Annotated Notes/Song-Liu Chenweng-Commentary"
        },
        "宋-蘇軾-撰": {
            "zh": "宋-蘇軾-撰",
            "en": "Song-Su Shi-Chu"
        },
        "唐-杜佑-撰": {
            "zh": "唐-杜佑-撰",
            "en": "Tang-Du You-Writing"
        },
        "宋-樂史-撰": {
            "zh": "宋-樂史-撰",
            "en": "Song-Yue Shi-fiction"
        },
        "元-張清子-集注": {
            "zh": "元-張清子-集注",
            "en": "Yuan-Zhang Qingzi-Highlights"
        },
        "南宋-輔廣": {
            "zh": "南宋-輔廣",
            "en": "Southern Song Dynasty-Fu Guang"
        },
        "宋-嚴粲-撰": {
            "zh": "宋-嚴粲-撰",
            "en": "Song-Yan Can-written"
        },
        "晉-杜預-集解": {
            "zh": "晉-杜預-集解",
            "en": "Jin-Du Yu-set solution"
        },
        "宋-李公凱-撰": {
            "zh": "宋-李公凱-撰",
            "en": "Song-Li Gongkai-Written"
        },
        "元-李濂-撰": {
            "zh": "元-李濂-撰",
            "en": "Yuan-Li Lian-Yan"
        },
        "南宋-呂祖謙-纂": {
            "zh": "南宋-呂祖謙-纂",
            "en": "Southern Song Dynasty-Lv Zuqian-compiling"
        },
        "南宋-祝穆-撰": {
            "zh": "南宋-祝穆-撰",
            "en": "Southern Song Dynasty-Zhu Mu-Apocryphal"
        },
        "唐-杜甫-撰/宋-徐居仁-編次/宋-黃鶴-補注  \n": {
            "zh": "唐-杜甫-撰/宋-徐居仁-編次/宋-黃鶴-補注  \n",
            "en": "Tang-Du Fu-Written/Song-Xu Juren-edited/Song-Huang He-Supplementary note"
        },
        "南朝梁-蕭統-編撰/唐-李善-注/唐-五臣（呂延濟、劉良、張銑、呂向、李周瀚）-注": {
            "zh": "南朝梁-蕭統-編撰/唐-李善-注/唐-五臣（呂延濟、劉良、張銑、呂向、李周瀚）-注",
            "en": "Southern Liang-Xiao Tong-Compiled/Tang-Li Shan-Note/Tang-Wu Chen (Lu Yanji, Liu Liang, Zhang Mian, Lu Xiang, Li Zhouhan)-Note"
        },
        "唐-寒山": {
            "zh": "唐-寒山",
            "en": "Tang-Han Shan"
        },
        "元-譚景星-著/元-陳泗孔-編": {
            "zh": "元-譚景星-著/元-陳泗孔-編",
            "en": "Yuan-Tan Jingxing-Authored/Yuan-Chen Sikong-edited"
        },
        "南宋-釋居簡": {
            "zh": "南宋-釋居簡",
            "en": "Southern Song Dynasty-Shi Ju Jian"
        },
        "南宋-魏峴": {
            "zh": "南宋-魏峴",
            "en": "Southern Song Dynasty-Wei Xian"
        },
        "宋-王安石-撰": {
            "zh": "宋-王安石-撰",
            "en": "Song-Wang Anshi-Biography"
        },
        "宋-蘇洵 蘇軾 蘇轍-撰/宋-闕名-編": {
            "zh": "宋-蘇洵 蘇軾 蘇轍-撰/宋-闕名-編",
            "en": "Song-Su Xun/Su Shi/Su Zhe-compilation/Song-Que name-compilation"
        },
        "宋-寇宗奭-撰/[題]宋-劉信甫-校正": {
            "zh": "宋-寇宗奭-撰/[題]宋-劉信甫-校正",
            "en": "Song-Kou Zongshi-Written/[title] Song-Liu Xinfu-Correction"
        },
        "宋-釋悟明-撰": {
            "zh": "宋-釋悟明-撰",
            "en": "Song-Enlightenment-Ming-fiction"
        },
        "元-釋道泰 智境-編": {
            "zh": "元-釋道泰 智境-編",
            "en": "Yuan-Shi Tao Tai/Zhi Jing-Ed"
        },
        "北宋-宋祁-撰": {
            "zh": "北宋-宋祁-撰",
            "en": "Northern Song Dynasty-Song Qi-Apocryphal"
        },
        "北宋-陳師文等-校正": {
            "zh": "北宋-陳師文等-校正",
            "en": "Northern Song Dynasty-Chen Shiwen etc.-Correction"
        },
        "北宋-歐陽修-撰": {
            "zh": "北宋-歐陽修-撰",
            "en": "Northern Song Dynasty-Ouyang Xiu-Biography"
        },
        "元-倪士毅-撰": {
            "zh": "元-倪士毅-撰",
            "en": "Yuan-Ni Shiyi-written"
        },
        "元-汪克寬-撰": {
            "zh": "元-汪克寬-撰",
            "en": "Yuan-Wang Kekuan-written"
        },
        "南宋-王稱-著": {
            "zh": "南宋-王稱-著",
            "en": "Southern Song Dynasty-Wang Zheng-written"
        },
        "北宋-蘇軾-撰/南宋-王十朋-纂集/南宋-赵夔-注": {
            "zh": "北宋-蘇軾-撰/南宋-王十朋-纂集/南宋-赵夔-注",
            "en": "Northern Song Dynasty-Su Shi-compilation/Southern Song Dynasty-Wang Shipeng-Compilation/Southern Song Dynasty-Zhao Ku-Notes"
        },
        "南宋-楊萬里-著/南宋-楊長儒-編/南宋-羅茂良-校勘": {
            "zh": "南宋-楊萬里-著/南宋-楊長儒-編/南宋-羅茂良-校勘",
            "en": "The Southern Song Dynasty-Yang Wanli-Written/The Southern Song Dynasty-Yang Changru-edited/The Southern Song Dynasty-Luo Maoliang-collated"
        },
        "南宋-楊萬里-著": {
            "zh": "南宋-楊萬里-著",
            "en": "Southern Song Dynasty-Yang Wanli-written"
        },
        "南宋-崔敦诗-著": {
            "zh": "南宋-崔敦诗-著",
            "en": "Southern Song Dynasty-Cui Dun-written"
        },
        "金元之际-元好问-编": {
            "zh": "金元之际-元好问-编",
            "en": "Jin-Yuan time-Yuan Haowen-edit"
        },
        "宋-李昉-纂": {
            "zh": "宋-李昉-纂",
            "en": "Song-Li Fang-Zuo"
        },
        "宋-陳景沂-編輯/宋-祝穆-訂正": {
            "zh": "宋-陳景沂-編輯/宋-祝穆-訂正",
            "en": "Song-Chen Jingyi-Editor/Song-Zhu Mu-Revision"
        },
        "宋-楊萬里-撰述/宋-周公恕-編類": {
            "zh": "宋-楊萬里-撰述/宋-周公恕-編類",
            "en": "Song-Yang Wanli-Writing/Song-Zhou Gongshu-editing"
        },
        "宋-陳元靚-編": {
            "zh": "宋-陳元靚-編",
            "en": "Song-Chen Yuan-Liang-Eds"
        },
        "-": {
            "zh": "-",
            "en": "-"
        },
        "北宋-丁度-修定": {
            "zh": "北宋-丁度-修定",
            "en": "Northern Song Dynasty-Ding Du-Xiu Ding"
        },
        "隋-巢元方-編撰": {
            "zh": "隋-巢元方-編撰",
            "en": "Sui-Chao Yuanfang-Compiled"
        },
        "南宋-董楷-撰": {
            "zh": "南宋-董楷-撰",
            "en": "Southern Song Dynasty-Dong Kai-written"
        },
        "元-許謙-撰": {
            "zh": "元-許謙-撰",
            "en": "Yuan-Xu Qian-Yan-Zhuan"
        },
        "南宋-黃公紹-編撰; 元-熊忠-舉要": {
            "zh": "南宋-黃公紹-編撰; 元-熊忠-舉要",
            "en": "Southern Song Dynasty-Huang Gongshao-Compiled/Yuan-Xiong Zhong-Juyi"
        }
    },
    volume: {
        "10": {
            "zh": "10",
            "en": "10"
        },
        "60": {
            "zh": "60",
            "en": "60"
        },
        "80": {
            "zh": "80",
            "en": "80"
        },
        "16": {
            "zh": "16",
            "en": "16"
        },
        "1": {
            "zh": "1",
            "en": "1"
        },
        "11": {
            "zh": "11",
            "en": "11"
        },
        "6": {
            "zh": "6",
            "en": "6"
        },
        "20": {
            "zh": "20",
            "en": "20"
        },
        "9": {
            "zh": "9",
            "en": "9"
        },
        "21": {
            "zh": "21",
            "en": "21"
        },
        "3": {
            "zh": "3",
            "en": "3"
        },
        "5": {
            "zh": "5",
            "en": "5"
        },
        "70": {
            "zh": "70",
            "en": "70"
        },
        "25": {
            "zh": "25",
            "en": "25"
        },
        "130": {
            "zh": "130",
            "en": "130"
        },
        "30": {
            "zh": "30",
            "en": "30"
        },
        "50": {
            "zh": "50",
            "en": "50"
        },
        "200": {
            "zh": "200",
            "en": "200"
        },
        "36": {
            "zh": "36",
            "en": "36"
        },
        "2": {
            "zh": "2",
            "en": "2"
        },
        "24": {
            "zh": "24",
            "en": "24"
        },
        "273": {
            "zh": "273",
            "en": "273"
        },
        "不分卷": {
            "zh": "不分卷",
            "en": "Undivided volume"
        },
        "10（外集、語錄不分卷）": {
            "zh": "10（外集、語錄不分卷）",
            "en": "10 (external collection, quotations do not separate volumes)"
        },
        "100（存1-70）": {
            "zh": "100（存1-70）",
            "en": "100 (save 1-70)"
        },
        "100（目錄2卷）": {
            "zh": "100（目錄2卷）",
            "en": "100 (Directory Volume 2)"
        },
        "42(目錄1卷敘例5卷）": {
            "zh": "42(目錄1卷敘例5卷）",
            "en": "42(Directory 1 volume Description 5 volumes)"
        },
        "存18卷": {
            "zh": "存18卷",
            "en": "Save 18 volumes"
        },
        "10卷": {
            "zh": "10卷",
            "en": "10 volumes"
        },
        "全153卷存69卷": {
            "zh": "全153卷存69卷",
            "en": "All 153 volumes of 69 volumes"
        },
        "14卷+12卷": {
            "zh": "14卷+12卷",
            "en": "14 rolls +12 rolls"
        },
        "30卷": {
            "zh": "30卷",
            "en": "30 volumes"
        },
        "133": {
            "zh": "133",
            "en": "133"
        },
        "8": {
            "zh": "8",
            "en": "8"
        },
        "1000": {
            "zh": "1000",
            "en": "1000"
        },
        "原58(現存41)": {
            "zh": "原58(現存41)",
            "en": "Original 58(now 41)"
        },
        "原41(現存40）": {
            "zh": "原41(現存40）",
            "en": "Original 41(extant 40)"
        },
        " 10（卷一原缺）": {
            "zh": " 10（卷一原缺）",
            "en": "10 (Book I original missing)"
        },
        "50（卷四十至四十三原缺，以酌源堂藏本鈔補；卷三十七亦有兩葉為鈔補）": {
            "zh": "50（卷四十至四十三原缺，以酌源堂藏本鈔補；卷三十七亦有兩葉為鈔補）",
            "en": "50 (Volume 40 to 43 original missing, with the source of the library notes; Volume 37 also has two leaves for notes)"
        }
    },
    version: {
        "南宋蜀大字本": {
            "zh": "南宋蜀大字本",
            "en": "Shu characters of the Southern Song Dynasty"
        },
        "宋明州六家注本": {
            "zh": "宋明州六家注本",
            "en": "Song Mingzhou six annotated"
        },
        "南宋紹興府華嚴會小字印本（依紹興府廣教院舊本校勘，傳寫有闕略差訛處，依清涼國師疏文添入改正）": {
            "zh": "南宋紹興府華嚴會小字印本（依紹興府廣教院舊本校勘，傳寫有闕略差訛處，依清涼國師疏文添入改正）",
            "en": "Small print of Hua Yan Hui of Shaoxing Prefecture in Southern Song Dynasty (collated according to the old edition of Shaoxing Prefecture College of Education, there are errors in the biography, which are corrected according to the thin text of the cool National Master)"
        },
        "元代浙刻本？": {
            "zh": "元代浙刻本？",
            "en": "Yuan Dynasty Zhejiang engravings?"
        },
        "元天曆元年刻本": {
            "zh": "元天曆元年刻本",
            "en": "Yuan calendar first year engraved"
        },
        "北宋天聖、明道間小字刻本": {
            "zh": "北宋天聖、明道間小字刻本",
            "en": "The Northern Song Dynasty, between the small characters engraved"
        },
        "元刻本": {
            "zh": "元刻本",
            "en": "metascript"
        },
        "元余志安刻本": {
            "zh": "元余志安刻本",
            "en": "Yuan Yu Zhi 'an engraved copy"
        },
        "南宋孝宗淳熙十二年江南西路轉運司刻寧宗慶元元年重修本": {
            "zh": "南宋孝宗淳熙十二年江南西路轉運司刻寧宗慶元元年重修本",
            "en": "The Southern Song Dynasty Xiao Zong Chunxi twelve years south of the South Road transport Department Kerning Zong Qing Yuan first year revision"
        },
        "南宋翻刻北宋國子監刻單疏本": {
            "zh": "南宋翻刻北宋國子監刻單疏本",
            "en": "The Southern Song Dynasty copied the Northern Song Dynasty Guozijian engraved single thin book"
        },
        "南宋浙江南西路轉運司丘崈刊本": {
            "zh": "南宋浙江南西路轉運司丘崈刊本",
            "en": "The southern song dynasty in zhejiang province south road transport department 丘崈 versions"
        },
        "南宋淳熙年間刻本": {
            "zh": "南宋淳熙年間刻本",
            "en": "Engraved in Chunxi period of Southern Song Dynasty"
        },
        "南宋刻本": {
            "zh": "南宋刻本",
            "en": "The Southern Song Dynasty"
        },
        "德新堂刊本": {
            "zh": "德新堂刊本",
            "en": "De Xin Tang edition"
        },
        "元至正二年刊明成化九年修本": {
            "zh": "元至正二年刊明成化九年修本",
            "en": "Yuan to Zheng two years of Ming Chenghua nine years of revision"
        },
        "南宋刊本": {
            "zh": "南宋刊本",
            "en": "The Southern Song Dynasty edition"
        },
        "北宋刻本": {
            "zh": "北宋刻本",
            "en": "The Northern Song Dynasty"
        },
        "宋孝宗乾道間洪适於紹興府任上精加校刻善本": {
            "zh": "宋孝宗乾道間洪适於紹興府任上精加校刻善本",
            "en": "Song Xiaozong Qiandao Hongshi in Shaoxing House on the fine school engraved rare"
        },
        "元至元二十五年彭寅翁崇道精舍刻本": {
            "zh": "元至元二十五年彭寅翁崇道精舍刻本",
            "en": "Yuan to yuan 25 years Peng Yin Weng Chong Road Jingshe engraving"
        },
        "南宋東陽崇川余四十三郎宅刊本": {
            "zh": "南宋東陽崇川余四十三郎宅刊本",
            "en": "The Southern Song Dynasty Dongyang Chongchuan Yu forty Sanlang house edition"
        },
        "元毋逢辰刊本": {
            "zh": "元毋逢辰刊本",
            "en": "This is a rare edition"
        },
        "北宋刊本": {
            "zh": "北宋刊本",
            "en": "Published in the Northern Song Dynasty"
        },
        "元刻元印本": {
            "zh": "元刻元印本",
            "en": "Yuan engraving yuan printing"
        },
        "元余志安勤有堂刊本": {
            "zh": "元余志安勤有堂刊本",
            "en": "Yuzhi Anqin Yutang edition"
        },
        "南宋興國軍學刊本": {
            "zh": "南宋興國軍學刊本",
            "en": "The Southern Song Dynasty Xingguo Military Science edition"
        },
        "南宋末建安刊本": {
            "zh": "南宋末建安刊本",
            "en": "Jian 'an edition of the late Southern Song Dynasty"
        },
        "元代建刊本": {
            "zh": "元代建刊本",
            "en": "The Yuan Dynasty built the edition"
        },
        "元代麻沙本（劉氏靜得堂本）": {
            "zh": "元代麻沙本（劉氏靜得堂本）",
            "en": "Yuan Dynasty Ma Sha Ben (Liu Jingde Tang Ben)"
        },
        "南宋理宗朝建陽坊刻祝穆原本": {
            "zh": "南宋理宗朝建陽坊刻祝穆原本",
            "en": "Southern Song Dynasty Lizong Jianyang Square carved Zhu Mu originally"
        },
        "元至正八年潘屏山圭山書院刻本": {
            "zh": "元至正八年潘屏山圭山書院刻本",
            "en": "Yuan Zhi Zheng eight years Pan Pingshan Guishan Academy engraving"
        },
        "宋元遞修贛州州學六臣注本": {
            "zh": "宋元遞修贛州州學六臣注本",
            "en": "In the Song and Yuan Dynasties, six ministers of Ganzhou study were prepared"
        },
        "南宋無我慧身本": {
            "zh": "南宋無我慧身本",
            "en": "The Southern Song Dynasty had no self wisdom"
        },
        "元延祐刊本": {
            "zh": "元延祐刊本",
            "en": "Motoon-yeonuke edition"
        },
        "室町覆宋版（1-4）南宋宋刊本（5-10、語錄）淳祐宋刊本（外集）": {
            "zh": "室町覆宋版（1-4）南宋宋刊本（5-10、語錄）淳祐宋刊本（外集）",
            "en": "Muromachi Nanyang Song Edition (1-4) Southern Song Edition (5-10, Quotations) Junyou Song Edition (Outer collection)"
        },
        "南宋寶慶刻本": {
            "zh": "南宋寶慶刻本",
            "en": "Southern Song Dynasty Baoqing engraving"
        },
        "南宋高宗紹興年間龍舒郡齋刻本": {
            "zh": "南宋高宗紹興年間龍舒郡齋刻本",
            "en": "An engraving of Longshu County Zhai in the Shaoxing Period of Emperor Gaozong of the Southern Song Dynasty"
        },
        "南宋紹興刻本": {
            "zh": "南宋紹興刻本",
            "en": "Shaoxing Engraving of the Southern Song Dynasty"
        },
        "南宋建安余彥國勵賢堂刻本": {
            "zh": "南宋建安余彥國勵賢堂刻本",
            "en": "Jian 'an Yuyan Guo Lixian Hall Engraving of the Southern Song Dynasty"
        },
        "元世祖至元年間重刻本": {
            "zh": "元世祖至元年間重刻本",
            "en": "Yuan Shizu to Yuan Dynasty reprint"
        },
        "元大德十一年初刻本": {
            "zh": "元大德十一年初刻本",
            "en": "The original was engraved at the beginning of the eleventh day of the Yuan Dynasty"
        },
        "元廬陵古林書堂刊本": {
            "zh": "元廬陵古林書堂刊本",
            "en": "Yuan Luling Gulin Book Hall edition"
        },
        "南宋慶元周必大本": {
            "zh": "南宋慶元周必大本",
            "en": "The Southern Song Dynasty, Qing Yuan Dynasty, Zhou must have a large book"
        },
        "元至正二年建安劉叔簡日新書堂刊本": {
            "zh": "元至正二年建安劉叔簡日新書堂刊本",
            "en": "Yuan to Zheng two years Jian 'an Liu Shujian New book hall"
        },
        "元至正八年建安劉叔簡日新堂刊本": {
            "zh": "元至正八年建安劉叔簡日新堂刊本",
            "en": "Yuan Zhizheng eight years Jian 'an Liu Shujian Nissin Tang edition"
        },
        "南宋眉山程舍人宅刻本": {
            "zh": "南宋眉山程舍人宅刻本",
            "en": "Southern Song Dynasty Meishan Cheng house carved"
        },
        "南宋建安魏忠卿家塾刻本": {
            "zh": "南宋建安魏忠卿家塾刻本",
            "en": "An engraved copy of Wei Zhongqing Family School in Jian 'an of Southern Song Dynasty"
        },
        "南宋端平本": {
            "zh": "南宋端平本",
            "en": "The Southern Song Dynasty"
        },
        "南宋肇慶軍府刊本": {
            "zh": "南宋肇慶軍府刊本",
            "en": "The Southern Song Dynasty Zhaoqing Junfu edition"
        },
        "南宋浙中刻本": {
            "zh": "南宋浙中刻本",
            "en": "The Central Zhejiang Engraving of the Southern Song Dynasty"
        },
        "元乙卯新刊本": {
            "zh": "元乙卯新刊本",
            "en": "Yuan Yimao new edition"
        },
        "南宋慶元六年成都府學蒲叔獻刊本(鐮倉、天正文祿間補鈔）": {
            "zh": "南宋慶元六年成都府學蒲叔獻刊本(鐮倉、天正文祿間補鈔）",
            "en": "In the sixth year of the Qing and Yuan Dynasties of the Southern Song Dynasty, Chengdu Fuxue Pu Shuxian (Kamakura, Tianzhengwen Lu Jian supplement banknotes)"
        },
        "南宋刻、元末明初刊、江戶補鈔本": {
            "zh": "南宋刻、元末明初刊、江戶補鈔本",
            "en": "The Southern Song Dynasty, the end of the Ming Dynasty, Edo banknote book"
        },
        "元順帝至元六年鄭氏積誠堂刊本": {
            "zh": "元順帝至元六年鄭氏積誠堂刊本",
            "en": "Yuan-shun Emperor to Yuan-Yuan sixth year published by Zheng Ji Cheng Tang"
        },
        "南宋金州軍本": {
            "zh": "南宋金州軍本",
            "en": "Jinzhou Army of the Southern Song Dynasty"
        },
        "懷仙閣本": {
            "zh": "懷仙閣本",
            "en": "Huai Xianji Ben"
        },
        "翠巖精舍本": {
            "zh": "翠巖精舍本",
            "en": "Cuiyan Jing House this"
        },
        "宗文精舍覆刻本": {
            "zh": "宗文精舍覆刻本",
            "en": "Zongwen Jingshe engraved copies"
        }
    },
    location_name: {
        "蜀": {
            "zh": "蜀",
            "en": "shu"
        },
        "明州": {
            "zh": "明州",
            "en": "Minnesota"
        },
        "紹興府": {
            "zh": "紹興府",
            "en": "Shaoxing prefecture"
        },
        "浙江": {
            "zh": "浙江",
            "en": "Zhejiang"
        },
        "-": {
            "zh": "-",
            "en": "-"
        },
        "江南西路轉運司": {
            "zh": "江南西路轉運司",
            "en": "Jiangnan West Road transport Department"
        },
        "江南州": {
            "zh": "江南州",
            "en": "Jiangnan Prefecture"
        },
        "當塗郡": {
            "zh": "當塗郡",
            "en": "Dangtu county"
        },
        "南宋": {
            "zh": "南宋",
            "en": "Southern Song Dynasty"
        },
        "建安德新堂": {
            "zh": "建安德新堂",
            "en": "Build a new hall"
        },
        "西湖書院": {
            "zh": "西湖書院",
            "en": "West Lake Academy"
        },
        "臨安": {
            "zh": "臨安",
            "en": "Lin 'an"
        },
        "吉州安福": {
            "zh": "吉州安福",
            "en": "Keju Anfu"
        },
        "東陽": {
            "zh": "東陽",
            "en": "Dongyang"
        },
        "建陽考亭": {
            "zh": "建陽考亭",
            "en": "Jianyang Kaoting"
        },
        "江西": {
            "zh": "江西",
            "en": "Jiangxi"
        },
        "建安": {
            "zh": "建安",
            "en": "Jian 'an"
        },
        "興國": {
            "zh": "興國",
            "en": "Rejuvenate the country"
        },
        "建": {
            "zh": "建",
            "en": "build"
        },
        "圭山書院": {
            "zh": "圭山書院",
            "en": "Keisan Seowon"
        },
        "贛州": {
            "zh": "贛州",
            "en": "Ganzhou"
        },
        "湖廣": {
            "zh": "湖廣",
            "en": "Huguang"
        },
        "龍舒": {
            "zh": "龍舒",
            "en": "Long Shu"
        },
        "松江澱山": {
            "zh": "松江澱山",
            "en": "Songjiang Lake Mountain"
        },
        "揚州": {
            "zh": "揚州",
            "en": "Yangzhou"
        },
        "廬陵": {
            "zh": "廬陵",
            "en": "Luling"
        },
        "建陽": {
            "zh": "建陽",
            "en": "Jianyang"
        },
        "肇慶": {
            "zh": "肇慶",
            "en": "Zhaoqing"
        },
        "成都府學": {
            "zh": "成都府學",
            "en": "Chengdu Fuxue"
        },
        "金州": {
            "zh": "金州",
            "en": "Golden State"
        },
        "福建建陽": {
            "zh": "福建建陽",
            "en": "Jianyang, Fujian Province"
        },
        "福建": {
            "zh": "福建",
            "en": "Fujian Province"
        }
    }
}

export const table_title = {
    geoMapTitle: {
        流传详情: {
            "zh": "流传详情",
            "en": "Circulation Details"
        },
        书名: {
            "zh": "书名",
            "en": "Book Name"
        },
        版本: {
            "zh": "版本",
            "en": "Version"
        },
        责任者: {
            "zh": "责任者",
            "en": "Author"
        },
        刊刻地: {
            "zh": "刊刻地",
            "en": "Engraving Place"
        },
        刊刻时间: {
            "zh": "刊刻时间",
            "en": "Engraving Time"
        },
        总卷数: {
            "zh": "总卷数",
            "en": "Volume"
        },
        书籍类型: {
            "zh": "书籍类型",
            "en": "Book type"
        },
        來源: {
            "zh": "來源",
            "en": "Source"
        },
        经手人: {
            "zh": "经手人",
            "en": "Handler"
        },
        经手人身份: {
            "zh": "经手人身份",
            "en": "Handler Type"
        },
        经手方式: {
            "zh": "经手方式",
            "en": "Handling Method"
        },
        数据来源: {
            "zh": "数据来源",
            "en": "Data source"
        },
    },
    書名: {
        "zh": "書名",
        "en": "Book Name"
    },
    收藏地: {
        "zh": "收藏地",
        "en": "Collecting Place"
    },
    '收藏者/經手者': {
        "zh": "收藏者/經手者",
        "en": "Collector"
    },
    經手方式: {
        "zh": "經手方式",
        "en": "Handling Method"
    },
    地點: {
        "zh": "地點",
        "en": "Location"
    },
    時間: {
        "zh": "時間",
        "en": "Time"
    },
    次序: {
        "zh": "次序",
        "en": "Sequence"
    },
    來源: {
        "zh": "來源",
        "en": "Source"
    },
    責任者: {
        "zh": "責任者",
        "en": "Author"
    },
    卷數: {
        "zh": "卷數",
        "en": "Volume"
    },
    版本: {
        "zh": "版本",
        "en": "Version"
    },
    時代: {
        "zh": "時代",
        "en": "Time Period"
    },
    刊刻地: {
        "zh": "刊刻地",
        "en": "Engraving Place"
    },
    刊刻时间: {
        "zh": "刊刻时间",
        "en": "Engraving Time"
    }
}