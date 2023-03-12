from crontab import CronTab

cron = CronTab()

# Job 1 - Logs health of all nodes
job1 = cron.new(command='health_log.sh')
job1.setall('0 * * * *')  # run every hour
cron.write()

# Job 2 - Deletes >7 days old logs
job2 = cron.new(command='health_log_del.sh')
job2.setall('0 18 * * 5')  # run every friday 6pm
cron.write()
