from typing import TypedDict
# from datetime import datetime, timezone

class ChiEngText(TypedDict): # 文字信息需要中英文版本
    chi: str 
    eng: str

class Date(TypedDict):
    createdDate: str
    issuedDate: str

class Relation(TypedDict): # 和单个印章的有关的印章
    identical: list[str] # 所有与该印章相同的印章
    collection: list[str] # 所有其他和该印章属于同一个collection的印章uuid
    


class Classification(TypedDict):
    official: bool
    yangEngrave: bool

class Img(TypedDict):  # 书画图像
    uuid: str
    source: str  # source platform
    predicted: bool
    accessDate: str
    path: str
    shape: list[int, int] # pixel size [w, h]
    extension: str

    author: list[ChiEngText]
    title: ChiEngText
    publisher: ChiEngText
    timeDescription: ChiEngText # 时间的文本信息
    intro: ChiEngText
    realSize: list[float, float] # 现实中画作的大小 [w, h] 单位: 厘米
    sealNumber: int


class Seal(TypedDict):
    uuid: str # 画作上的印章的uuid
    uuidDb: str # 匹配到数据库中印章的uuid
    sealPath: str
    imgPath: str
    bbox: list[int, int, int, int] # 原画作图像上的bbox 左上角为起点 [x, y, w, h], 用于计算
    bboxRight: list[int, int, int, int] # 按照阅读方向的bbox(右上角为起点)[x, y, w, h]
    index: int # 在当前画作上的编号
    text: ChiEngText # 印章上的文字
    embedding: list # 印章图像特征
    ownerUuid: str # 印章拥有者的id
    classify: Classification # 印章分类
    relation: Relation # 和该印章有关的印章
    order: int # 该图像上印章的序号


class Owner(TypedDict):
    uuid: str
    timeDescription: str
    time: list[str, str]
    intro: ChiEngText

class SealDB(TypedDict):
    uuid: str
    shape: list[int, int]
    sealPath: str
    text: ChiEngText
    embedding: list
    ownerUuid: str 
    classify: Classification
    collection: list[str] # 和这个印章属于同一个collection的印章的uuid

    



book_format = { # eg: input: a book pdf
    "title": "孝经", # 古籍名称
    "time": "北宋时期", # 绘制信息等
    "category": ["经部"],
    "size_info": "一册。半页框 20.8x15.2 厘米，十五行行二十二到二十五字不等（小字双行），左右双边，白口单黑鱼尾，下题：「孝經」",# 行款版式
    "source": "香港大学冯平山图书馆藏", # 收藏来源
    "seal_collection": ['棭齋','狩谷','望之','狩谷望之','審定宋本','湯島狩','谷氏求古楼','圖書記','脩竹蔭'], # 钤印信息(整本书所包含的)
    "total_pages": 30,
    "seal":[
        {
            "extraction": "img_path", # extracted stamp
            "bbox": [0, 0, 10, 10],  # 该印章位置: XYWH (以当前页面图像大小为参考)
            "binding": 1, # 印章数据库中的id (根据匹配得到)
            "page_index": 10 #所在页数
        },
        ...
    ]
}

seal_meta_info = {  # 可以从故宫博物馆收集到下述所有信息
    "id": 1, #唯一标识的id
    "name": "玛瑙龟纽'抑斋'印", # 印章名称
    "image": 'img', # 用于对比匹配的图像
    "dynasty": "清", # 朝代
    "empire": "乾隆", # 帝王
    "type": 0, # 0: 阴刻 1:阳刻
    "content": "抑斋",  # 钤印信息
    "real_size": [1.3,1.6,1.6], # 面宽 长 通高 纽高
    "material": "玛瑙",
    "other_img": '', # 其他角度下的图片
}
    # "page_shape": [[400,200,3],[500,400,3],...], # 每一页图像大小