.PHONY: create clean

# Create the Susan model
create:
	ollama create susan -f ./susan.model

# Remove the Susan model
clean:
	ollama rm susan

# Default target
.DEFAULT_GOAL := create 
