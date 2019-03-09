'use strict'

var debug=true;


var searchNYTimes = {
     searchWords: ""
    ,numberOfRecordsRequested: 0
    ,numberOfPagesToRequest: 1
    ,numberOfArticlesShown: 0
    ,startDate: ""
    ,endDate: ""
    ,queryURL: ""
    ,website: "https://api.nytimes.com/svc/search/v2/articlesearch.json?q="
    ,apikey: "tNze5r0ChKVXUEiH1MiOMkifZyKZ5ail"
    ,response: []
    ,queryResponseStatus: ""
    ,totalNumberofHits: 0
    ,initialize: function (){
        this.searchWords = "";
        this.numberOfPagesToRequest = 0;
        this.numberOfPagesToRequest = 1;
        this.startDate = "";
        this.endDate = "";
        this.queryURL = "";
        this.response = [];
        this.queryResponseStatus = "";
        this.totalNumberofHits = 0;
        this.numberOfArticlesShown = 0;
    }
    ,createQueryURL: function(){
        this.queryURL = this.website + this.searchWords + 
        "&page=0" + //page number will be changed as needed right before sending out the ajax query
        "&api-key=" + this.apikey;

        if(this.startDate && this.endDate){
            this.queryURL = this.queryURL + "&begin_date=" + this.startDate + "&end_date=" + this.endDate;
        }
        if(debug){console.log(this.queryURL);} 
    // TODO: q=obama&facet_fields=source&facet=true& begin_date= 20120101&end_date=20121231
    }
}

// ALL ABOUT EVENTS --------------------------------------------
$(document).ready(function(){

    // hideTopResultsDiv();
    // hideArticleDiv();

    $("#btn-submit").on("click", function(event){
        if(debug){console.log("Event: Clicked on Submit");}
        event.preventDefault();
        start();
    });

    $("#btn-reset").on("click", function(){
        if(debug){console.log("Event: Clicked on Clear All");}
        event.preventDefault();
        //clear the search form
        $("#input-search").val("");
        $("#input-number").val("10")
        hideTopResultsDiv();
    });
});


// ----------------

function start(){
    if(debug){console.log("Function: start");}

    if($("#input-search").val()===""){
        if(debug){console.log("no search words - no action");}
        return false;
    }
    searchNYTimes.initialize();
    clearTheResultsDiv();
    showTopResultsDiv();
    readTheForm();
    calculateHowManyPages();
    searchNYTimes.createQueryURL();
    sendAjaxRequest();
}

function readTheForm(){
    if(debug){console.log("Function: readTheForm");}

    //get the key words
    var search = $("#input-search").val();
    search = search.trim().replace(" ", "+");

    if(debug){console.log("search: ", search);}
    searchNYTimes.searchWords = search;

    //get the number of records requested
    searchNYTimes.numberOfRecordsRequested = $("#input-number").val();
    if(debug){console.log("number: ", searchNYTimes.numberOfRecordsRequested);}


    searchNYTimes.startDate = $("#input-start-date").val();
    if(debug){console.log("start date: ", searchNYTimes.startDate);}
    searchNYTimes.endDate = $("#input-end-date").val();
    if(debug){console.log("end date: ", searchNYTimes.endDate);}
}

function calculateHowManyPages(){
    var pages = Math.ceil(searchNYTimes.numberOfRecordsRequested/10);
    if(debug){console.log("number of pages to request for", pages);}
    searchNYTimes.numberOfPagesToRequest = pages;

    if(debug){console.log("function: calculateHowManyPaged:", pages)}
}

function sendAjaxRequest(){
    if(debug){console.log("Function: sendAjaxRequest");}
    var pages = searchNYTimes.numberOfPagesToRequest;
    var queryURL = searchNYTimes.queryURL;

    for(var i = 0; i < pages; i++) {

        queryURL = queryURL.replace("page=0", "page=" + i);
        if(debug){console.log(queryURL);}
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            console.log("Ajax response", response)
            //save the query response status
            searchNYTimes.queryResponseStatus = response.status;
            
            //Not 'OK'
            if(response.status!="OK") {
                console.log("Error returned from NYT-API, status: ", response.status);
                return false;
            //query was successful
            } else {
                showTheListOfArticles(response.response.docs);
            }
        }).catch(function(){
            console.log("Ajax Error...need more soap");
        });
    }
}

function showTheListOfArticles(articles){
    if(debug){console.log("Function: showTheListOfArticles", articles);}

    var countGoal = parseInt(searchNYTimes.numberOfRecordsRequested);
    var countCurrent = parseInt(searchNYTimes.numberOfArticlesShown);

    for(var i=0; i < articles.length ; i++){
        createTheArticleElement(articles[i]);
        countCurrent++;

        if(debug){console.log(countGoal, "  ", countCurrent);}

        //check if the number of articles needed has been reached
        if(countCurrent===countGoal){
            if(debug){console.log("countGoal has been reached");}
            searchNYTimes.numberOfArticlesShown = countCurrent;
            return false;
        }
    }
    searchNYTimes.numberOfArticlesShown = countCurrent;
}

function createTheArticleElement(article){
    if(debug){console.log("Function: createTheArticleElement");}

    var title = article.headline.main;
    //var author = article.byline.original;
    var snippet = article.snippet;
    var url = article.web_url;

    var p_title = $("<h6>").text(title)
    var a_title = $("<a></a>").attr({"href":url,"target":"_blank"}).append(p_title);
    //var p_author = $("<p>").text(author);
    var p_snippet = $("<p></p>").text(snippet);


    var div_article = $("<div>").attr("data-url",url).addClass("container border-bottom mt-4 article");
    div_article.append(a_title).append(p_snippet);

    postTheArticle(div_article);
}

function postTheArticle(div_article){
    $("#results").append(div_article);
}

function clearTheResultsDiv(){
    $("#results").empty();
}

function showTopResultsDiv(){
    $("#top-results").fadeIn(600);
}

function hideTopResultsDiv(){
    $("#top-results").fadeOut(600);
}