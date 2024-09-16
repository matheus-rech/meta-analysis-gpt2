# R/api.R

required_packages <- c("plumber", "jsonlite", "memoise", "future", "promises", "validator", "meta", "metafor", "netmeta", "ggplot2", "futile.logger", "ratelimitr", "dmetar", "metaSEM")
new_packages <- required_packages[!(required_packages %in% installed.packages()[,"Package"])]
if(length(new_packages)) install.packages(new_packages)
lapply(required_packages, library, character.only = TRUE)

library(plumber)
library(jsonlite)
library(memoise)
library(future)
library(promises)
library(validator)
library(meta)
library(metafor)
library(netmeta)
library(ggplot2)
library(futile.logger)
library(ratelimitr)

source("utils/data_validation.R")
source("utils/error_handling.R")
source("analysis/meta_analysis.R")
source("analysis/network_meta_analysis.R")
source("analysis/sensitivity_analysis.R")
source("analysis/meta_regression.R")

#* @apiTitle MetaGPT API

#* Perform Meta-Analysis
#* @param data JSON string of input data
#* @param analysisType String indicating the type of analysis
#* @post /perform_meta_analysis
function(req, res) {
  rate_limiter(function() {
    tryCatch({
      data <- jsonlite::fromJSON(req$postBody$data)
      analysisType <- req$postBody$analysisType
      
      result <- switch(analysisType,
        "standard" = perform_meta_analysis(data, ...),
        "network" = perform_network_meta_analysis(data),
        "sem" = perform_sem_meta_analysis(data, ...),
        stop("Invalid analysis type")
      )
      
      # Convert ggplot objects to base64 encoded PNG images
      # ... (existing code for plot conversion)
      
      res$setHeader("Content-Type", "application/json")
      res$body <- jsonlite::toJSON(list(result = result, status = 200), auto_unbox = TRUE, pretty = TRUE)
      res
    }, error = function(e) {
      handle_error(e, res)
    })
  })()
}

#* Perform Network Meta-Analysis
#* @param data JSON string of input data
#* @post /perform_network_meta_analysis
function(req, res) {
  tryCatch({
    data <- jsonlite::fromJSON(req$postBody)
    validated_data <- validate_network_meta_analysis_data(data)
    result <- perform_network_meta_analysis(validated_data)
    res$setHeader("Content-Type", "application/json")
    res$body <- jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE)
    res
  }, error = handle_error)
}

#* Perform Sensitivity Analysis
#* @param data JSON string of input data
#* @post /perform_sensitivity_analysis
function(req, res) {
  tryCatch({
    data <- jsonlite::fromJSON(req$postBody)
    validated_data <- validate_sensitivity_analysis_data(data)
    result <- perform_sensitivity_analysis(validated_data)
    res$setHeader("Content-Type", "application/json")
    res$body <- jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE)
    res
  }, error = handle_error)
}

#* Perform Meta-Regression
#* @param data JSON string of input data
#* @post /perform_meta_regression
function(req, res) {
  tryCatch({
    data <- jsonlite::fromJSON(req$postBody)
    validated_data <- validate_meta_regression_data(data)
    result <- perform_meta_regression(validated_data)
    res$setHeader("Content-Type", "application/json")
    res$body <- jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE)
    res
  }, error = handle_error)
}

#* Perform SEM Meta-Analysis
#* @param data JSON string of input data
#* @param model_formula String representation of the model formula
#* @post /perform_sem_meta_analysis
function(req, res) {
  rate_limiter(function() {
    tryCatch({
      data <- jsonlite::fromJSON(req$postBody$data)
      model_formula <- req$postBody$model_formula
      validated_data <- validate_sem_meta_analysis_data(data, model_formula)
      
      future_promise({
        result <- perform_sem_meta_analysis(validated_data$data, validated_data$model_formula)
        
        # Convert ggplot objects to base64 encoded PNG images
        result$forest_plot <- base64enc::base64encode(
          ggplot2::ggsave(plot = result$forest_plot, filename = tempfile(fileext = ".png"), device = "png")
        )
        result$funnel_plot <- base64enc::base64encode(
          ggplot2::ggsave(plot = result$funnel_plot, filename = tempfile(fileext = ".png"), device = "png")
        )
        
        list(result = result, status = 200)
      }) %...>%
      (function(result) {
        res$setHeader("Content-Type", "application/json")
        res$body <- jsonlite::toJSON(result, auto_unbox = TRUE, pretty = TRUE)
        res
      }) %...!%
      (function(err) {
        handle_error(err, res)
      })
    }, error = function(e) {
      handle_error(e, res)
    })
  })()
}

# Add a health check endpoint
#* @get /health
function() {
  list(status = "OK", timestamp = Sys.time())
}

# Set up logging
flog.appender(appender.file("api.log"))

# Define rate limiter
rate_limiter <- limit_rate(rate = 10, period = 60)

# Apply rate limiter to all endpoints
#* @filter rate_limit
function(req, res) {
  rate_limiter(function() {
    plumber::forward()
  })()
}

# Log API start
flog.info("API started on port 8000")

# Run the API
# To start the API, run this script using `Rscript run_api.R`

#* @filter cors
cors <- function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  } else {
    plumber::forward()
  }
}