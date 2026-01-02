import os

# 配置
IMAGE_DIR = 'images'
HTML_FILE = 'index.html'
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}

def generate_gallery_html():
    # 获取图片文件列表
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: Directory '{IMAGE_DIR}' not found. Please create it and add images.")
        return []

    images = [f for f in os.listdir(IMAGE_DIR) 
              if os.path.splitext(f)[1].lower() in ALLOWED_EXTENSIONS]
    
    # 按文件名排序，保证顺序一致
    images.sort()

    if not images:
        print(f"Warning: No images found in '{IMAGE_DIR}'.")
        return []

    html_lines = []
    for img in images:
        # 使用相对路径
        img_path = f"{IMAGE_DIR}/{img}"
        # 生成 HTML 结构
        line = f'        <div class="artwork-item"><img src="{img_path}" alt="{img}"></div>'
        html_lines.append(line)
    
    return html_lines

def update_index_html(new_content_lines):
    try:
        with open(HTML_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: '{HTML_FILE}' not found.")
        return

    # 寻找标记点
    start_marker = '<!-- GALLERY_START -->'
    end_marker = '<!-- GALLERY_END -->'

    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)

    if start_idx == -1 or end_idx == -1:
        print("Error: Markers <!-- GALLERY_START --> or <!-- GALLERY_END --> not found in HTML.")
        return

    # 拼接新内容
    # 保留标记本身，方便下次更新
    before = content[:start_idx + len(start_marker)]
    after = content[end_idx:]
    
    new_gallery_content = '\n' + '\n'.join(new_content_lines) + '\n    '

    new_full_content = before + new_gallery_content + after

    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(new_full_content)
    
    print(f"Successfully updated {HTML_FILE} with {len(new_content_lines)} images.")

if __name__ == '__main__':
    print("Scanning for images...")
    gallery_html = generate_gallery_html()
    if gallery_html:
        update_index_html(gallery_html)
    else:
        print("No changes made to index.html (no images found).")
