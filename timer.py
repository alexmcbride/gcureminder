import threading
import urllib2

def checkReminders():
    print 'checking reminders'
    response = urllib2.urlopen('https://gcureminder.herokuapp.com/api/notifications/check-reminders')
    html = response.read()
    print html

t = threading.Timer(60.0, checkReminders)
t.start()