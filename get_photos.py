import os
from pathlib import Path

from boto3.session import Session
from dotenv import load_dotenv

load_dotenv()


def get_article_dict(root_dir):
    blog_dir = (root_dir / "content/blog").resolve()
    article_dict = {}
    for article_dir in blog_dir.iterdir():
        article_dict[article_dir.name] = article_dir

    return article_dict


def download_image(s3, s3_obj, article_dict):
    parent_folder, file_name = s3_obj["Key"].split("/")
    if parent_folder in article_dict:
        file_path = article_dict[parent_folder] / file_name
        if not file_path.exists():
            print(f"Downloading {s3_obj['Key']}")
            with open(file_path.absolute(), "wb") as image_file:
                s3.download_fileobj(
                    Bucket=os.environ["S3_BUCKET_NAME"],
                    Key=s3_obj["Key"],
                    Fileobj=image_file,
                )
        else:
            print(f"Skipping {s3_obj['Key']}. File already exists")


def main():
    root_dir = Path(__file__).resolve().parent
    article_dict = get_article_dict(root_dir)

    aws_ses = Session(
        aws_access_key_id=os.environ["BF_AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["BF_AWS_SECRET_ACCESS_KEY"],
        region_name=os.environ["BF_AWS_REGION"],
    )
    s3 = aws_ses.client("s3")
    s3_objs = s3.list_objects_v2(Bucket=os.environ["S3_BUCKET_NAME"])

    for s3_obj in s3_objs["Contents"]:
        download_image(s3, s3_obj, article_dict)


if __name__ == "__main__":
    main()
