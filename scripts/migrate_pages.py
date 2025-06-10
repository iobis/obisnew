import os
import shutil
import frontmatter
import subprocess
import re


source_dir = "../web"
target_dir = "../obisnew"


def update_source_folder():
    os.chdir(source_dir)
    subprocess.run(["git", "checkout", "patching"])
    subprocess.run(["git", "pull"])


def migrate_images(content):
    image_paths = re.findall(r'src="([^"]*)"', content)
    
    target_images_dir = os.path.abspath(os.path.join(target_dir, "images"))
    os.makedirs(target_images_dir, exist_ok=True)
    
    for img_path in image_paths:
        if img_path.startswith('/'):
            img_path = img_path[1:]
        source_img = os.path.abspath(os.path.join(source_dir, img_path))
        target_img = os.path.abspath(os.path.join(target_dir, img_path))
        
        os.makedirs(os.path.dirname(target_img), exist_ok=True)
        
        if os.path.exists(source_img):
            shutil.copy2(source_img, target_img)
            print(f"Copied image: {source_img} -> {target_img}")
        else:
            print(f"Warning: Image not found: {source_img}")
    
    return content


def migrate_file(old_path, new_path, content_processors=None):
    source_path = os.path.abspath(os.path.join(source_dir, old_path))
    target_path = os.path.abspath(os.path.join(target_dir, new_path))

    print(f"Moving {source_path} to {target_path}")

    with open(source_path, 'r', encoding='utf-8') as f:
        post = frontmatter.load(f)
    
    if 'title' in post.metadata:
        post.content = f"# {post.metadata['title']}\n\n{post.content}"
    
    if content_processors:
        if not isinstance(content_processors, list):
            content_processors = [content_processors]
        for processor in content_processors:
            post.content = processor(post.content)
    
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter.dumps(post))


def remove_script_blocks(content):
    return re.sub(r'<script>.*?</script>', '', content, flags=re.DOTALL)


def remove_image_blocks(content):
    return re.sub(r'<img[^>]*>', '', content)


def remove_includes(content, include_file=None):
    if include_file:
        pattern = r'{%\s*include\s+' + re.escape(include_file) + r'\s*%}'
    else:
        pattern = r'{%\s*include\s+[^%}]*\s*%}'
    return re.sub(pattern, '', content)


if __name__ == "__main__":
    update_source_folder()

    migrate_file("about/visionmission.md", "about/visionmission.md", [remove_script_blocks, remove_image_blocks])
    migrate_file("about/nodes.md", "about/nodes.md", [remove_script_blocks, lambda content: remove_includes(content, "mapfooter.html")])
    migrate_file("about/governance.md", "about/governance.md", [remove_script_blocks])
    migrate_file("about/sponsor.md", "about/partner.md", [remove_script_blocks, migrate_images])

    migrate_file("whatwedo/core-activities.md", "whatwedo/core-activities.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/impact.md", "whatwedo/impact.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/objectives.md", "whatwedo/objectives.md", [remove_script_blocks, migrate_images])
