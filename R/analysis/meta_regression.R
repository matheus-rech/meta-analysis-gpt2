library(metafor)

perform_meta_regression <- function(data) {
  # Perform meta-regression
  rma_result <- rma(yi = data$effect_size, sei = data$se, mods = ~ data$moderator, data = data)
  return(summary(rma_result))
}