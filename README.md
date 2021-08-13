# empower Backend

```bash
# clone the project
git clone https://mdhinsightinc.visualstudio.com/Administration/_git/Administration

# install virtual environments
pip install virtualenv
# make virtual environment
virtualenv venv -p python3

# activate the environment
source venv/bin/activate

# install dependencies
pip install -r requirements.txt

# login to mysql and create databases per company (ex. user=root, passw=root)
mysql -u root -p
root~~~~~~~~

# master database
create database admin_master;  

# database per company  

    
# run migrations
python manage.py makemigrations

# apply migrations per database (use our custom migrate command)
python manage.py migrate

# create superuser


# Keep in mind this populate_db is only once (first time you create the db)

# run the server
python manage.py runserver

# django admin  
# http://localhost:8007/admin/

# EDI API URL to show the dashboard data 
# http://localhost:8003/api