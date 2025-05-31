.PHONY: create clean help

# Create the Susan model
create:
	ollama create susan -f ./susan.model

# Remove the Susan model
clean:
	ollama rm susan

# Show available targets
help:
	@echo "Available targets:"
	@echo "  create  - Create the Susan model from susan.model"
	@echo "  clean   - Remove the Susan model"
	@echo "  help    - Show this help message"

# Default target
.DEFAULT_GOAL := create 