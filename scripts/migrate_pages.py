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


def migrate_images(post):
    content = post.content
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
    
    return post


def process_thumbnail(post):
    if 'thumbnail' in post.metadata:
        # Add /images/ prefix if not already present
        if not post.metadata['thumbnail'].startswith('/images/'):
            post.metadata['thumbnail'] = f"/images/{post.metadata['thumbnail']}"
        
        # Migrate the thumbnail image
        img_path = post.metadata['thumbnail'].lstrip('/')  # Remove leading slash
        source_img = os.path.abspath(os.path.join(source_dir, "images/thumbnails", os.path.basename(post.metadata['thumbnail'])))
        target_img = os.path.abspath(os.path.join(target_dir, img_path))
        
        # Create target directory if it doesn't exist
        os.makedirs(os.path.dirname(target_img), exist_ok=True)
        
        # Copy the image
        if os.path.exists(source_img):
            shutil.copy2(source_img, target_img)
            print(f"Copied thumbnail: {source_img} -> {target_img}")
        else:
            print(f"Warning: Thumbnail not found: {source_img}")
        
        # Move thumbnail path to image field and remove thumbnail
        post.metadata['image'] = post.metadata['thumbnail']
        del post.metadata['thumbnail']
    
    return post


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
            post = processor(post)
        
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(frontmatter.dumps(post))


def remove_script_blocks(post):
    post.content = re.sub(r'<script>.*?</script>', '', post.content, flags=re.DOTALL)
    return post


def remove_image_blocks(post):
    post.content = re.sub(r'<img[^>]*>', '', post.content)
    return post


def remove_includes(post, include_file=None):
    if include_file:
        pattern = r'{%\s*include\s+' + re.escape(include_file) + r'\s*%}'
    else:
        pattern = r'{%\s*include\s+[^%}]*\s*%}'
    post.content = re.sub(pattern, '', post.content)
    return post


def migrate_all_posts():
    # Get all markdown files in the _posts directory
    posts_dir = os.path.join(source_dir, "_posts")
    for root, dirs, files in os.walk(posts_dir):
        for file in files:
            if file.endswith('.md'):
                # Get relative path from _posts
                rel_path = os.path.relpath(os.path.join(root, file), posts_dir)
                # Remove language directory (e.g., 'en/') if present
                if '/' in rel_path:
                    rel_path = rel_path.split('/', 1)[1]
                # Create target path
                target_path = os.path.join("_posts", rel_path)
                # Migrate the file
                migrate_file(os.path.join("_posts", rel_path), target_path, [migrate_images, process_thumbnail])


if __name__ == "__main__":
    update_source_folder()

    # pages
    
    migrate_file("about/visionmission.md", "about/visionmission.md", [remove_script_blocks, remove_image_blocks])
    migrate_file("about/nodes.md", "about/nodes.md", [remove_script_blocks, lambda content: remove_includes(content, "mapfooter.html")])
    migrate_file("about/governance.md", "about/governance.md", [remove_script_blocks])
    migrate_file("about/sponsor.md", "about/partner.md", [remove_script_blocks, migrate_images])

    migrate_file("whatwedo/core-activities.md", "whatwedo/core-activities.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/impact.md", "whatwedo/impact.md", [remove_script_blocks, migrate_images])
    migrate_file("whatwedo/objectives.md", "whatwedo/objectives.md", [remove_script_blocks, migrate_images])

    # Migrate all posts
    migrate_all_posts()
