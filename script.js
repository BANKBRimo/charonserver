document.getElementById("search").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        location.hash = "search/" + document.getElementById("search").value
        document.getElementById("search").value = null
    }
});

document.getElementById("search2").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        location.hash = "profile/" + document.getElementById("search2").value
        document.getElementById("search2").value = null
    }
});

async function apiSearch(category="all",author="all",query="all",startAt=0){
    console.log("/api/"+category+"/"+author+"/"+query+"/"+startAt)
    return (await fetch("/api/"+category+"/"+author+"/"+query+"/"+startAt)).json()
}

async function apiGet(page){
    return (await fetch("/api/"+page)).json()
}

async function apiFindPost(id){
    return (await fetch("/api/findPost/"+id)).json()
}

async function search(category,author="all",query="all",startAt=0,currentPage=1,previous=[]){
    NProgress.start()
    donc = await(apiSearch(category,author,query,startAt))
    if(donc["next"]!="-"){
        previous.push(startAt)
        urlNext = "#search/" + query + "/" + category + "/"+ author + "/" + donc["next"] + "/" + (Number(currentPage)+1) + "/" + previous.join(";")
        previous.pop()
    }else{
        urlNext = null
    }
    if(previous!=[] && currentPage!=1){
        urlPrev = "#search/" + query + "/" + category + "/" + author + "/" + previous.pop() + "/" + (Number(currentPage)-1) + "/" + previous.join(";")
    }else{
        urlPrev = null
    }
    document.getElementById("main").innerHTML = ""
    document.getElementById("main").appendChild(createArticleList(query,donc["data"],urlNext,currentPage,urlPrev))
    NProgress.done()
}

async function loadPage(number){
    NProgress.start()
    donc = await apiGet(number)
    document.getElementById("main").innerText = ""
    document.getElementById("main").appendChild(createArticle(donc))
    NProgress.done()
}

async function loadProfile(author,startAt=0,currentPage=1,previous=[]){
    NProgress.start()
    donc = await apiSearch("all",author,"all",startAt)
    if(donc["next"]!="-"){
        previous.push(startAt)
        urlNext = "#profile/" + author + "/" +  donc["next"] + "/" + (Number(currentPage)+1) + "/" + previous.join(";")
        previous.pop()
    }else{
        urlNext = null
    }
    if(previous!=[] && currentPage!=1){
        urlPrev = "#profile/" + author + "/" +  previous.pop() + "/" + (Number(currentPage)-1) + "/" + previous.join(";")
    }else{
        urlPrev = null
    }
    document.getElementById("main").innerHTML = ""
    document.getElementById("main").appendChild(createArticleList(author,donc["data"],urlNext,currentPage,urlPrev))
    NProgress.done()
}

async function loadCategory(category,startAt=0,currentPage=1,previous=[]){
    NProgress.start()
    donc = await(apiSearch(category,"",startAt))
    if(donc["next"]!="-"){
        previous.push(startAt)
        urlNext = "#category/" + category + "/" +  donc["next"] + "/" + (Number(currentPage)+1) + "/" + previous.join(";")
        previous.pop()
    }else{
        urlNext = null
    }
    if(previous!=[] && currentPage!=1){
        urlPrev = "#category/" + category + "/" +  previous.pop() + "/" + (Number(currentPage)-1) + "/" + previous.join(";")
    }else{
        urlPrev = null
    }
    document.getElementById("main").innerHTML = ""
    document.getElementById("main").appendChild(createArticleList(category,donc["data"],urlNext,currentPage,urlPrev))
    NProgress.done()
}

async function loadCategories(){
    donc = await (await fetch("/categories_de.json")).json()
    f = document.getElementById("categories")
    donc.forEach(element => {
        k = document.createElement("a")
        k.appendChild(document.createTextNode(element[0]))
        k.href = "#category/"+element[1]
        k.id = element[1]
        f.appendChild(k)
    })
}

function createArticleList(title,articles,next=null,current=null,previous=null){
    var div = document.createElement("div")
    div.style.position = "relative"
    var hr = document.createElement("hr")

    var name = document.createElement("div")
    name.classList = "nameProfile"
    name.appendChild(document.createTextNode(title))
    div.appendChild(name)

    var page = document.createElement("div")
    page.classList = "pageProfile"

    if(previous!=null){
        prev = document.createElement("a")
        prev.href = previous
        prev.appendChild(document.createTextNode("<"))
        page.appendChild(prev)
    }

    if(current!=null){
        page.appendChild(document.createTextNode("Seite " + current))
    }

    if(next!=null){
        nxt = document.createElement("a")
        nxt.href = next
        nxt.appendChild(document.createTextNode(">"))
        page.appendChild(nxt)
    }

    div.appendChild(page)

    div.appendChild(hr)

    if(articles.length==0){
        var text = document.createElement("div")
        text.classList = "textProfile"
        text.appendChild(document.createTextNode("Keine Artikel vorhanden"))
        div.appendChild(text)
    }else{
        for (let i = 0; i < articles.length; i++) {
            const element = articles[i];
            var article = document.createElement("a")
            article.href = "#" + element["file"]
            article.classList = "invis"

            var title = document.createElement("div")
            title.classList = "titleProfile"
            title.appendChild(document.createTextNode(element["title"]))

            var date = document.createElement("div")
            date.classList = "dateProfile"
            date.appendChild(document.createTextNode(element["date"].split("T")[0]))

            article.appendChild(date)
            article.appendChild(title)

            div.appendChild(article)
        }
    }

    return div
}

function createArticle(data){
    var div = document.createElement("div")

    var author = document.createElement("a")
    author.classList = "authorArticle invis"
    author.href = "#profile/"+data["poster"]
    author.appendChild(document.createTextNode(data["poster"]))

    var date = document.createElement("div")
    date.classList = "dateArticle"
    
    date.appendChild(document.createTextNode(data["date"].split(".")[0].replace("T"," ")))
    

    var title = document.createElement("div")
    title.classList = "titleArticle"
    title.appendChild(document.createTextNode(data["title"]))

    var votes = document.createElement("div")
    votes.classList = "votesArticle"
    votes.appendChild(document.createTextNode(data["up_votes"] + "/" + data["down_votes"]))
    
    var content = document.createElement("div")
    content.classList = "contentArticle"
    content.innerHTML = parseText(data["body"])

    var replies = createReplies(data["replies"])

    div.appendChild(date)
    div.appendChild(title)
    div.appendChild(author)
    div.appendChild(votes)
    if(data["embed"]!=undefined){
        var embed = createEmbed(data["embed"])
        div.appendChild(embed)
    }
    div.appendChild(content)
    div.appendChild(replies)

    return div
}

function createEmbed(data){
    var div = document.createElement("div")
    div.classList = "embed"

    var url = document.createElement("a")
    url.appendChild(document.createTextNode(data["url"]))
    url.href = data["url"]
    url.target = "_blank"

    var img = document.createElement("img")
    img.src = data["image"]

    var desc = document.createElement("p")
    var title = document.createElement("b")
    title.appendChild(document.createTextNode(data["title"]))
    desc.appendChild(title)
    desc.appendChild(document.createElement("br"))
    desc.appendChild(document.createTextNode(data["description"]))

    div.appendChild(url)
    div.appendChild(img)
    div.appendChild(desc)

    return div
}

function createReplies(data){
    var div = document.createElement("div")
    data.forEach(element => {
        div.appendChild(createReply(element))
    });
    return div
}

function createReply(data){
    var div = document.createElement("div")
    div.classList = "reply"

    var author = document.createElement("a")
    author.classList = "authorReply invis"
    author.href = "#profile/"+data["poster"]
    author.appendChild(document.createTextNode(data["poster"]))

    var date = document.createElement("div")
    date.classList = "dateReply"
    date.appendChild(document.createTextNode(data["date"].split(".")[0].replace("T"," ")))

    var votes = document.createElement("div")
    votes.classList = "votesReply"
    votes.appendChild(document.createTextNode(data["up_votes"] + "/" + data["down_votes"]))
    
    var content = document.createElement("div")
    content.classList = "contentReply"
    content.innerHTML = parseText(data["body"])

    var replies = createReplies(data["replies"])

    div.appendChild(date)
    div.appendChild(author)
    div.appendChild(votes)
    div.appendChild(content)
    div.appendChild(replies)

    return div
}

function parseText(data){
    data =  data.replace(/> \[\{quoted\}\]\((.+?)\)\n>\n/gu,'>{{user:$1}}\n>\n')
    data =  data.replace(/>\n/gu,'>&lrm;\n')
    data =  data.replace(/^>(.*?)$\n/gum,'<div class="quote">$1</div>')
    data =  data.replace(/-{3,}/gu,'<hr />')
    data =  data.replace(/_{3,}/gu,'<hr />')
    data =  data.replace(/\*{3,}/gu,'<hr />')
    data =  data.replace(/_(.+?)_/gu,'<em>$1</em>')
    data =  data.replace(/\*\*(.+?)\*\*/gu,'<b>$1</b>')
    data =  data.replace(/\*(.+?)\*/gu,'<em>$1</em>')
    data =  data.replace(/~(.+?)~/gu,'<del>$1</del>')
    data =  data.replace(/\{\{user:name=(.+?),.+?\}\}/gu,'<a href="#profile/$1">$1:</a>')
    data =  data.replace(/\{\{sticker:(.+?)\}\}/gu,'<img class="sticker" src="assets/sticker/$1.png"></img>')
    data =  data.replace(/\{\{champion:(.+?)\}\}/gu,'<img class="icon" src="assets/champion/$1.png"></img>')
    data =  data.replace(/\{\{summoner:(.+?)\}\}/gu,'<img class="icon" src="assets/summoner/$1.png"></img>')
    data =  data.replace(/\{\{item:(.+?)\}\}/gu,'<img class="icon" src="assets/item/$1.png"></img>')
    data =  data.replace(/(.{7,8}boards\..{2,3}\.leagueoflegends\.com\/.{2,3}\/c\/([^ ]+?)(?:-de)?\/([^ ]{8}).+?)(?: |\n|$)/gu,'[$1](#post/$3)')
    data =  data.replace(/\[(.+?)\]\((.+?)\)/gu,'<a target="_blank" href="$2">$1</a>')
    data =  data.replace(/(https:\/\/[^>]+?)( |\n|$)/gu,'<a target="_blank" href="$1">$1</a>$2')
    data =  data.replace(/(http:\/\/[^>]+?)( |\n|$)/gu,'<a target="_blank" href="$1">$1</a>$2')
    data =  data.replace(/\n/gu, "<br />");
    return data
}

window.onhashchange = function(){
    h = location.hash.substr(1).split("/")
    if(h.length==1){
        if(h[0]==""){
            loadCategory("all")
        }else{
            loadPage(h[0])
        }
    }else{
        if(h[0]=="profile"){
            if(h.length==5){
                loadProfile(h[1],h[2],h[3],h[4].split(";"))
            }else{
                loadProfile(h[1])
            }
        }else if(h[0]=="search"){
            if(h.length==7){
                search(h[2],h[3],h[1],h[4],h[5],h[6].split(";"))
            }else if(h.length==4){
                search(h[2],h[3],h[1])
            }else if(h.length==3){
                search(h[2],"all",h[1])
            }else{
                search("all","all",h[1])
            }
        }else if(h[0]=="category"){
            if(h.length==5){
                loadCategory(h[1],h[2],h[3],h[4].split(";"))
            }else{
                loadCategory(h[1])
            }
        }else if(h[0]=="post"){
            apiFindPost(h[1]).then((post) => {
                location.hash = post["file"]
            })
        }else{
            loadPage(h[0],h[1])
        }
    }
}

var decodeHTML = function (html) {
	var txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
};

window.onhashchange()
loadCategories()