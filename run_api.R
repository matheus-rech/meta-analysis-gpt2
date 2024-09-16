# run_api.R

library(plumber)
library(futile.logger)

flog.appender(appender.file("api.log"))

# Source the API
api <- tryCatch({
  flog.info("Loading API...")
  plumb("R/api.R")
}, error = function(e) {
  flog.error("Error loading API: %s", conditionMessage(e))
  quit(status = 1)
})

# Run the API on port 8000
tryCatch({
  flog.info("Starting API on port 8000...")
  api$run(port = 8000)
}, error = function(e) {
  flog.error("Error starting API: %s", conditionMessage(e))
  quit(status = 1)
})