import sqlite3
conn = sqlite3.connect('dev.db')
cursor = conn.cursor()
cursor.execute("SELECT DISTINCT statusName FROM UserStatus")
print("UserStatus names:", cursor.fetchall())

cursor.execute("SELECT DISTINCT statusName FROM ContentStatus")
print("ContentStatus names:", cursor.fetchall())

cursor.execute("SELECT DISTINCT eventCategoryName FROM EventCategory")
print("EventCategory names:", cursor.fetchall())

cursor.execute("SELECT U.id, US.statusName FROM User U JOIN UserStatus US ON U.userStatusId = US.id LIMIT 10")
print("Users and status:", cursor.fetchall())

cursor.execute("SELECT B.title, B.adminId, B.authorId, US.statusName FROM Bulletin B JOIN User U ON B.authorId = U.id JOIN UserStatus US ON U.userStatusId = US.id")
print("Bulletins, author status:", cursor.fetchall())
