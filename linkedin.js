/* Generate a script to perform web scraping tasks in JavaScript at Talent42, Jun 2023
Bret got chatgot to create a script that scrapes LinkedIn searches with the same accuracy as IDS (before they blocked it) who's trying to get GPT to reverse engineer the prompt that would result in the working script.
Apparently, the prompt needed is just as long and technical as the actual script.. 
1. Smoothly scroll the page down until no new elements are loaded.
2. Scrape all the search results from a Google SERP.
3. Extract email addresses using regex from each search result.
4. Split the title into name, title, and company using "-" as the delimiter.
5. Output the results to the console in TSV format.
6. Trigger the download of the results as a TSV file.

This will return a script that will scrape a google x-ray search of Linkedin.com/in
if any e-mails are in those search results, it grabs them.  Not perfect as it doesn't account for that not everyone's "title"
is Name | Title | Company but many are
it outputs this: */

// Smoothly scrolls the page down until no new elements are loaded
function smoothScrollDown() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollTop + clientHeight >= scrollHeight) {
    console.log("Reached the bottom of the page.");
    setTimeout(scrapeSearchResults, 2000); // Adjust the delay here if needed
    return;
  }

  window.scrollBy(0, 20); // Adjust the scroll speed here
  setTimeout(smoothScrollDown, 20); // Adjust the scroll delay here
}

// Scrapes all the search results from a Google SERP
function scrapeSearchResults() {
  const searchResults = document.querySelectorAll('.g'); // Assuming search results are wrapped in <div class="g"> elements
  const data = [];

  searchResults.forEach((result) => {
    const title = result.querySelector('h3')?.textContent;
    const link = result.querySelector('a')?.href;
    const descriptionSpans = result.querySelectorAll('span');
    const emails = [];

    descriptionSpans.forEach((span) => {
      const text = span.textContent || '';
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
      const matches = text.match(emailRegex);

      if (matches) {
        matches.forEach((match) => {
          emails.push(match);
        });
      }
    });

    // Split title into name, title, and company using "-"
    const [name, position, company] = title ? title.split(' - ') : ['', '', ''];

    data.push({
      name,
      position,
      company,
      link,
      emails,
    });
  });

  outputResults(data);
  downloadTSV(data);
}

// Outputs search results in TSV format to console
function outputResults(data) {
  console.log("Name\tTitle\tCompany\tLink\tEmails");

  data.forEach((result) => {
    const { name, position, company, link, emails } = result;
    const tsvRow = [name, position, company, link, emails.join(', ')].join('\t');
    console.log(tsvRow);
  });
}

// Downloads search results as a TSV file
function downloadTSV(data) {
  let tsvContent = "Name\tTitle\tCompany\tLink\tEmails\n";

  data.forEach((result) => {
    const { name, position, company, link, emails } = result;
    const tsvRow = [name, position, company, link, emails.join(', ')].join('\t');
    tsvContent += tsvRow + '\n';
  });

  const tsvBlob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
  const element = document.createElement('a');
  element.href = URL.createObjectURL(tsvBlob);
  element.download = 'search_results.tsv';
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Call the smoothScrollDown function to initiate the process
smoothScrollDown();
