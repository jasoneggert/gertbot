# Getting w/ GertBot
Local chat app that saves the data, prompt, and response in Markdown with keywords tagged for use in Obsidian
- Change env.example to .env
- enter your openai key (OPENAI_API_KEY)
- choose which local path you would like markdown files saved.  (I use a specific folder in Obsidian) (LOCAL_STORAGE_PATH)
- if you would like to automatically replace any specific words in the prompts (eg. for privacy or IP reasons) define them in the env following the naming convention present in the env.example (REPLACE_WORD_0=Platform
REPLACE_VALUE_0=App)
- change react port if needed
- run yarn install
- run yarn app
