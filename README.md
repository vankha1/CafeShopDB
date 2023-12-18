# Cafe shop Database Assignemnt

A project about cafe shop using SQL Server in our Database System course

## User Interface
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/homepage.png)
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/staffhomepage.png)
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/admin.png)
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/dish.png)
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/tablepage.png)
![](https://github.com/vankha1/CafeShopDB/blob/main/demo/invoice.png)

## How to use
To use the application, you will need to follow these steps:
1. Clone the repository via `git clone https://github.com/vankha1/CafeShopDB.git` and `cd` into the cloned repository
2. Install the require packages: `npm install`
3. Install MySQL benchmark (https://dev.mysql.com/downloads/workbench/) if you haven't
4. Create a database and add configuration into .env file.
5. Make sure to copy and paste SQL script into your database
6. Run `npm start` to start server
7. If you want to access admin page, please using account with email vovankha@gmail.com and password `123456`

## Self-accessment

### What I've learnt
- How to work with MySQL in NodeJS application using mysql2
- Having a chance to design UI with TailwindCSS which makes me love it so much
- Authentication and authorization with `express-session` and `express-mysql-session`
- As a database assignment, Database processes logic more than Backend with triggers, procedures, functions,...
### What I will refactor
- Add more attributes for some tables such as image, avatar,...
- I'm still not satisfied with authentication and authorization, so I will find the solution to do this better
- Because of the deadline, I used EJS template engine to finish in one week. Maybe later I will use Restful API (client with ReactJS or NextJS) to make UI/UX more smoothly.

