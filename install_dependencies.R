# List of required packages
packages <- c(
  "plumber", "jsonlite", "memoise", "future", "promises", "validator",
  "meta", "metafor", "netmeta", "ggplot2", "futile.logger", "ratelimitr",
  "dmetar", "metaSEM", "testthat", "httr"
)

# Install packages that are not already installed
new_packages <- packages[!(packages %in% installed.packages()[,"Package"])]
if(length(new_packages)) install.packages(new_packages)

# Load all packages to check for any issues
lapply(packages, library, character.only = TRUE)

print("All R dependencies installed successfully!")