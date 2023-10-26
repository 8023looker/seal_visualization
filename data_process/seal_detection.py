import cv2
import numpy as np
import json
import math
from itertools import chain

# 设置相对路径，将路径定位为当前文件夹
import os  # 导入os模块
os.chdir('E:\\DataVis\\vis_system\\seal_visualization\\data_process') # 更改当前工作目录

def hex2hsv():
    # 将16进制颜色转换为BGR
    hex_color = '#ED1C24'
    bgr_color = tuple(int(hex_color[i:i+2], 16) for i in (1, 3, 5))

    # 创建包含单一颜色的图像
    image = np.zeros((100, 100, 3), dtype=np.uint8)
    image[:] = bgr_color

    # 将BGR颜色转换为HSV
    hsv_color = cv2.cvtColor(np.uint8([[bgr_color]]), cv2.COLOR_BGR2HSV)[0][0]

    # 输出HSV值
    print("HSV:", hsv_color)


def seal_detections(img_path):
    # 读取图像
    image = cv2.imread(img_path)
    # 获取图像的大小（高度和宽度）
    height, width, _ = image.shape
    # 打印图像大小
    print(f'图像宽度：{width} 像素') # 2500
    print(f'图像高度：{height} 像素') # 1646

    # 定义红色的BGR范围
    lower_red = np.array([36, 28, 237]) # RGB:237, 28, 36
    upper_red = np.array([36, 28, 237])

    # 创建掩码，保留红色像素
    mask = cv2.inRange(image, lower_red, upper_red)

    # 对掩码进行形态学操作
    # kernel = np.ones((5, 5), np.uint8)
    # mask = cv2.erode(mask, kernel, iterations=1)
    # mask = cv2.dilate(mask, kernel, iterations=2)

    # 查找轮廓
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    contours, inner_contours = checkContourInside(contours)

    # 切割印章图片（序号对不上，放后面outer contour中去了）
    # 由于本身ndarry属性，首先存储为一个属性列表
    # inner_seal_para_list = []
    # for inner_index, inner_contour in enumerate(inner_contours):
    #     ix, iy, iw, ih = cv2.boundingRect(inner_contour)
    #     inner_seal_para_list.append({
    #         # "index": index, # 可以丢掉
    #         "x": ix,
    #         "x_right": width - ix,
    #         "y": iy,
    #         "width": iw,
    #         "height": ih
    #     })
    # inner_seal_para_list = resortSealList(inner_seal_para_list, width)
    # for inner_contour in inner_seal_para_list:
    #     inner_seal_para_list[inner_seal_para_list.index(inner_contour)]['index'] = inner_seal_para_list.index(inner_contour)
    #     # 从原图像中切割出轮廓部分
    #     roi = image[inner_contour['y']+1:inner_contour['y']+inner_contour['height']-1, inner_contour['x']+1:inner_contour['x']+inner_contour['width']-1]
    #     # 保存切割的部分 (save image)
    #     cv2.imwrite(f'./picture/seal_image/seal_{str(inner_seal_para_list.index(inner_contour))}.jpg', roi)
         
    # 遍历每个轮廓
    seal_para_list = []
    for index, contour in enumerate(contours):
        x, y, w, h = cv2.boundingRect(contour)
        
        cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        # annotateIndex(image, index, x, y)
        # print(type(x), type(y), type(w), type(h))
        print("左上角坐标: ({}, {})，宽度: {}，高度: {}".format(x, y, w, h))
            
        # # 从原图像中切割出轮廓部分 (切割外轮廓，abundon)
        # roi = image[y:y+h, x:x+w]
        # # print(str(index)) # success
        # # 保存切割的部分 (save image)
        # cv2.imwrite(f'./picture/seal_image/seal_{str(index)}.jpg', roi)
        
        # 存入list
        seal_para_list.append({
            "index": index,
            "x": x,
            "x_right": width - x,
            "y": y,
            "width": w,
            "height": h
        })
    
    # 写入.json文件
    seal_para_list = resortSealList(seal_para_list, width)
    # seal_para_list = sorted(seal_para_list, key=lambda seal: math.pow((width - (seal['x'] + seal['width'])) / 100, seal['y'] / 100)) # 按照离右上角的距离重排序
    for seal in seal_para_list:
        # 从原图像中切割出轮廓部分
        roi = image[seal['y']+5:seal['y']+seal['height']-5, seal['x']+5:seal['x']+seal['width']-5]
        # 保存切割的部分 (save image)
        cv2.imwrite(f'./picture/seal_image/seal_{str(seal_para_list.index(seal))}.jpg', roi)
    for seal in seal_para_list:
        seal_para_list[seal_para_list.index(seal)]['index'] = seal_para_list.index(seal)
        annotateIndex(image, seal_para_list.index(seal), seal['x'], seal['y'])
    seal2json(seal_para_list)
       
    # 显示标注后的图像
    cv2.imshow('Image with Annotations', image)
    cv2.imwrite(f'./picture/Image with Annotations.png', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


def checkContourInside(contour_list):
    existed_list, inner_seal_list = [], []
    for contour in contour_list:
        if len(existed_list) == 0:
            existed_list.append(contour)
        else:
            find_outer = False
            for existed_contour in existed_list:
                x_prev, y_prev, w_prev, h_prev = cv2.boundingRect(existed_contour)
                x_cur, y_cur, w_cur, h_cur = cv2.boundingRect(contour)
                if x_cur > x_prev and y_cur > y_prev and x_cur + w_cur < x_prev + w_prev and y_cur + h_cur < y_prev + h_prev:
                    print('Inner contour, abundon!')
                    inner_seal_list.append(contour)
                    find_outer = True
                    break
                elif x_cur < x_prev and y_cur < y_prev and x_cur + w_cur > x_prev + w_prev and y_cur + h_cur > y_prev + h_prev:
                    print('Outer contour, substitute!')
                    existed_list.remove(existed_contour)
                    existed_list.append(contour)
                    inner_seal_list.append(existed_contour)
                    find_outer = True
                    break
                
            if not find_outer:
                existed_list.append(contour)
    # inner_seal_list = getListDifference(contour_list, existed_list)
    return existed_list, inner_seal_list    

# abundon, TypeError: unhashable type: 'numpy.ndarray'
def getListDifference(total_list, existed_list):
    print([tuple(item) for item in total_list])
    # 将列表转换为集合
    total_set = set([tuple(item) for item in total_list])
    existed_set = set([tuple(item) for item in existed_list])
    # 使用difference方法获取差集
    difference = total_set.difference(existed_set)
    # 或者使用运算符 -
    # difference = total_set - existed_set
    # 将结果转换回列表
    result_list = [np.array(item) for item in difference]
    return result_list

def seal2json(input_list):
    # 将字典写入 JSON 文件
    with open('seal_para_data.json', 'w') as json_file:
        json.dump(input_list, json_file, indent=4, ensure_ascii=False)
        
def annotateIndex(image, index, x, y):
    # 指定要绘制的数字和字体
    font = cv2.FONT_HERSHEY_SIMPLEX
    text = str(index)  # 要标记的数字

    # 指定字体大小和颜色
    font_scale = 5
    font_color = (0, 255, 0)  # 红色，BGR颜色格式

    # 设置字体厚度
    font_thickness = 4

    # 使用cv2.putText函数在图像上绘制文本
    cv2.putText(image, text, (x, y), font, font_scale, font_color, font_thickness, lineType=cv2.LINE_AA)

# for test
def averageSealWidth(seal_list):
    seal_num = len(seal_list)
    sum_width = 0
    for seal in seal_list:
        sum_width += seal['width']
    print('印章平均宽度', sum_width / seal_num)
    return sum_width / seal_num

def resortSealList(ori_seal_list, pic_width): # data_structure: [[], [], ..., []]
    column_width = averageSealWidth(ori_seal_list)
    column_num = math.ceil(pic_width / column_width) # 分成这么多列
    seal_level_list = [[] for _ in range(column_num)]
    for seal in ori_seal_list:
        seal_level_list[math.floor(seal['x_right'] / column_num)].append(seal)
    for column_level in seal_level_list:
        seal_level_list[seal_level_list.index(column_level)] = sorted(seal_level_list[seal_level_list.index(column_level)], key=lambda seal: seal['y']) # 按照离右上角的距离重排序
    # seal_level_list = seal_level_list[::-1] # reverse(if x_right, this line is abundoned)
    return [item for sublist in seal_level_list for item in sublist]
    # print(list(chain.from_iterable(seal_level_list))) # method2: 调用itertools.chain
        
     
if __name__ == "__main__":
    # hex2hsv()
    seal_detections('.\picture\que_hua_qiu_se_tu_juan.png')