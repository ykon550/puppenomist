// execute on the cover page
const isIssuePattern = (link) => {
    const PATTERN = "https://www.economist.com/printedition/";
    const NOT_PATTERN = "https://www.economist.com/printedition/covers/";
    if (link.startsWith(PATTERN) && !link.startsWith(NOT_PATTERN)){
        return true;
    } else {
        return false;
    }
};

let links = [];
const anchors = $x('//div/a');
for (const a of anchors) {
    let link = a.href;
    if(isIssuePattern(link)){
        links.push(link);
    }
}

const issueLinks = Array.from(new Set(links)).sort();
issueLinks.map((link) => console.log(link));