import sys
import re
import time
import json
import requests
from datetime import datetime
from typing import Dict, Any

# 建议使用环境变量或配置文件来管理这些值
VERSION = "202406091320"
API_ENDPOINT = "https://api.aliyundrive.com"
TIMEOUT = 5

# tg
TG_PUSH_API_URL = "https://vercel.virola.me/api/send"

# 将全局变量移入配置或函数参数中
XIAOYA_NAME = "xiaoya"

push_msg_content = ""

def init_para() -> None:
    global refresh_token
    refresh_token = read_secure_file("mytoken.txt").strip()
    
    global folder_id
    folder_id = read_secure_file("temp_transfer_folder_id.txt").strip()
    
    global ip_address
    ip_address = read_secure_file("docker_address.txt").strip()
    
    global TG_SEND_KEY
    TG_SEND_KEY = read_secure_file("tg_send_key.txt").strip()

def echo(msg: str) -> None:
    # 存下消息内容
    global push_msg_content
    push_msg_content += f"{msg}\n"
    
    print(f"[{datetime.now().strftime('%Y/%m/%d %H:%M:%S')}] {msg}")

def read_secure_file(file_name: str) -> str:
    try:
        with open(f"./{file_name}", 'r') as file:
            # 假设有一个函数可以对敏感信息进行解密
            return file.read()
    except FileNotFoundError:
        return ""


def push_msg(message_content):
    """
    使用给定的API URL和消息内容调用API推送消息
    """
    # 构造请求数据，这里假设API期望一个名为'text'的字段
    data = {'text': message_content, 'sendkey': TG_SEND_KEY}
    
    try:
        # 发起POST请求
        response = requests.post(TG_PUSH_API_URL, data=data, timeout=TIMEOUT)
        
        # 检查请求是否成功
        if response.status_code == 200:
            print("Message pushed successfully!")
        else:
            print(f"Failed to push message. Status code: {response.status_code}")
            print("Response text:", response.text)
    except requests.exceptions.RequestException as e:
        print(f"A request error occurred: {e}")
def get_header() -> Dict[str, Any]:
    headers = {
        "Content-Type": "application/json"
    }
    HEADER = None
    data = {"grant_type": "refresh_token", "refresh_token": refresh_token}
    
    # 发送POST请求
    try:
        response = requests.post("https://api.aliyundrive.com/v2/account/token", headers=headers, data=json.dumps(data), timeout=TIMEOUT)
        response.raise_for_status()  # 确保请求成功
    except requests.RequestException as e:
        print("请求失败:", e, file=sys.stderr)
        exit(1)
    # 解析响应数据
    try:
        data = response.json()
        access_token = data.get('access_token')
        if access_token:
            HEADER=f"Authorization: Bearer {access_token}"
            headers["Authorization"] = f"Bearer {access_token}"
    except ValueError:
        print("解析JSON失败", file=sys.stderr)
        exit(1)
    
    if not HEADER:
        print("获取access token失败")
        return None

    # 等待指定时间以规避可能的并发问题
    time.sleep(3)

    # 发送POST请求
    try:
        response = requests.post("https://user.aliyundrive.com/v2/user/get", headers=headers, data={}, timeout=TIMEOUT)
        response.raise_for_status()  # 确保请求成功
    except requests.RequestException as e:
        print("请求失败:", e, file=sys.stderr)
        exit(1)

    # 解析响应数据
    try:
        data = response.json()
    except ValueError:
        print("解析JSON失败", file=sys.stderr)
        exit(1)

    # 获取drive_id
    # legacy_drive_id = data.get("default_drive_id")
    drive_id = data.get("resource_drive_id")

    print(f"drive_id='{drive_id}'")
    return headers, drive_id

def get_raw_list(headers: Dict[str, str], drive_id: str = None) -> str:
    url = f"{API_ENDPOINT}/adrive/v2/file/list"
    data = {
        "drive_id": drive_id,
        "parent_file_id": folder_id
    }

    try:
        response = requests.post(url, headers=headers, json=data, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"获取文件列表失败：folder_id={folder_id}, drive_id={drive_id}，原因：{e}", file=sys.stderr)
        return None

    if "items" not in response.text:
        print(f"获取文件列表失败：未找到'items'，folder_id={folder_id}, drive_id={drive_id}", file=sys.stderr)
        return None

    time.sleep(10)  # 考虑优化这一等待策略
    return response.text

def get_list(raw_list: str) -> list:
    file_ids = re.findall(r'"file_id":"(.*?)"', raw_list)
    return file_ids

def get_list_and_mapping(raw_list: str) -> tuple[list, dict]:
    """
    从原始JSON列表中提取file_ids并创建一个file_id到文件名的映射字典。
    """
    try:
        data_list = json.loads(raw_list)
    except json.JSONDecodeError:
        print("[ERROR]Invalid JSON format when parsing raw_list")
        return [], {}

    file_ids = []
    id_to_name_mapping = {}
    for item in data_list["items"]:
        if 'file_id' in item:
            file_id = item['file_id']
            file_ids.append(file_id)
            id_to_name_mapping[file_id] = item.get('name', "[ERROR]Name not found")

    return file_ids, id_to_name_mapping

# def get_file_path(file_id: str, drive_id: str, headers: Dict[str, str]) -> str:
#     url = f"{API_ENDPOINT}/adrive/v1/file/get_path"
#     headers = {
#         **headers,
#         "Content-Type": "application/json"
#     }
#     payload = {"drive_id": drive_id, "file_id": file_id}
    
#     try:
#         response = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
#         response.raise_for_status()
#         path_data = response.json()
        
#         names = [item['name'] for item in path_data['items']]
#         path = '/'.join(names)
        
#         return path
#     except requests.RequestException as e:
#         print(f"Request failed: {e}")
#         return None

def extract_name_by_file_id(raw_list, file_id):
    # 将原始字符串转换为Python对象列表
    try:
        data_list = json.loads(raw_list)
    except json.JSONDecodeError:
        return "[ERROR]Invalid JSON format"

    # 遍历列表，查找匹配的file_id并返回相应的name
    for item in data_list["items"]:
        if 'file_id' in item and item['file_id'] == file_id:
            return item.get('name', "[ERROR]Name not found")

    return "[ERROR]File ID not found"
def delete_files(drive_id, raw_list, HEADER):
    """
    删除阿里云盘上的文件。

    根据传入的line信息查找并删除指定文件。首先从line中提取文件ID，然后构建删除请求，
    最后发送请求删除文件并返回操作结果。

    参数:
    - file_ids: 包含文件信息的字符串，从中提取文件ID。
    - drive_id: 阿里云盘的ID。
    - raw_list: 要删除的文件列表。

    返回:
    - True: 文件删除成功。
    - False: 文件删除失败或未找到文件ID。
    """
    file_ids, id_to_name_mapping = get_list_and_mapping(raw_list)
    
    file_count = 0
    
    tmp_list = []
    for file_id in file_ids:
        tmp_list.append({
            "body": {
                "drive_id": drive_id,
                "file_id": file_id
            },
            "headers": {
                "Content-Type": "application/json"
            },
            "id": file_id,
            "method": "POST",
            "url": "/file/delete"
        })

    # Prepare request data
    request_data = {
        "requests": tmp_list,
        "resource": "file"
    }

    # Send DELETE request to Aliyun Drive API
    try:
        response = requests.post(
            "https://api.aliyundrive.com/v3/batch",
            headers=HEADER,
            json=request_data,
            timeout=TIMEOUT
        )
        response.raise_for_status()  # Raises stored HTTPError, if one occurred.
        
    except requests.RequestException as e:
        print(f"Request failed: {e}")
        return False

    print("======debug========")
    print(response.text)
    
    resjson = response.json()
    if resjson["responses"]:
        res_list = resjson["responses"]
        for res in res_list:
            if res["status"] == 204:
                file_id = res['id']
                name = id_to_name_mapping.get(file_id, "[ERROR]File ID not found in mapping")
                echo(f"彻底删除文件：/资源盘/{name}")
                file_count += 1
            else:
                echo(f"删除失败：{res['id']}")
    
    return file_count


def clear_aliyun():
    headers, drive_id = get_header()
    if not headers or not drive_id:
        return

    raw_list = get_raw_list(headers, drive_id)
    if not raw_list:
        return

    list_ids = get_list(raw_list)
    echo(f"共找到{len(list_ids)}个文件ID")

    if not list_ids:
        return

    echo(f"开始清理{XIAOYA_NAME}转存")

    file_count = delete_files(drive_id, raw_list, headers)
            
    echo(f"\n本次共清理小雅{XIAOYA_NAME}转存文件 {file_count}个")

def main():
    init_para()
    
    echo(f"[{datetime.now().strftime('%Y/%m/%d %H:%M:%S')}]小雅缓存清理(ver={VERSION})运行中")
    clear_aliyun()
    
    echo(f"地址：{ip_address}")
    echo(f"[{datetime.now().strftime('%Y/%m/%d %H:%M:%S')}]清理完成。")
    
    # tg推送
    if push_msg_content:
        push_msg(push_msg_content)

if __name__ == "__main__":
    main()