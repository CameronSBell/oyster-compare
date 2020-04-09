# oyster-compare
This project parses unstructured oyster card journey history data downloaded from the TfL Oyster website and gives metrics on your oyster journey history.
It tells the user whether they would save money by buying a yearly travelcard over a monthly travelcard, and if so, how much money they would be saving.
It also tells the user how much money they are spending outside their travelcard zones per month.

# User Instructions
1. Login to your TfL Oyster account, and download your oyster card journey history as a .CSV file. TfL allow you to download the previous 8 weeks of journey history.
2. Paste the .CSV into the directory: "oyster-compare\data\input"
3. Run "npm run main"
