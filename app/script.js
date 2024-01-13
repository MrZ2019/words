const { writeFileSync, readFileSync } = require("fs")

var DATA = readFileSync(__dirname + '/data/data.json')
DATA = JSON.parse(DATA.toString())

const settings = JSON.parse(localStorage['words_settings'] || '{}')
Object.assign({
   word: true, 
   wordcn: true, 
   example: true, 
   examplecn: true, 
}, settings)

var wordIndex
var APP
var WORD_LIST
entryApp()

entryInsert()
entryList()
entryRandom()



function entryInsert() {

    function write() {
        writeFileSync(__dirname + '/data/data.json',JSON.stringify(DATA))
    }
    $('#myTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    })
    

    $('#myTabs li:eq(3) a').tab('show')

    $('#btn-add').on('click', () => {
        var word = $('#word').val()
        var wordcn = $('#wordcn').val()
        var example = $('#example').val()
        var examplecn = $('#examplecn').val()

        var id = DATA.length
        DATA.push({
            id, word, wordcn, example, examplecn
        })
        write()

        $('#inp-word').autocompleter('destroy')
        entryList()

        
    })

    $('#btn-delete').on('click', () => {
        DATA.splice(wordIndex, 1)
        write()
        $('#inp-word').autocompleter('destroy')
        entryList()
    })
}

function entryList() {
    // var data = 
    // [
    //     {
    //         word: 'detective',
    //         wordcn: `n. 侦探；（头衔）警探
    //         adj. 侦探的`,
    //         example: 'The detective tried to reason out how the thief had escaped.',
    //         examplecn: '这个侦探反复琢磨想弄明白那个窃贼是怎样逃跑的。',
    //     }
    // ]

    function convert(data) {
        const result = []
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            
            result.push({
                index: index,
                label: element.word,
                value: element.word,
                wordcn: element.wordcn,
                example: element.example,
                examplecn: element.examplecn,
            })
        }
        return result
    }

    const newArr = WORD_LIST = convert(DATA)
    WORD_LIST = WORD_LIST.sort((a, b) => {
        return a.value > b.value
    })
    APP.$data.WORD_LIST = WORD_LIST

    $('#inp-word').autocompleter({
        // marker for autocomplete matches
        highlightMatches: true,

        // object to local or url to remote search
        source: newArr,

        // custom template
        template: '{{ label }} <span>({{ wordcn }})</span>',

        // show hint
        hint: true,

        // abort source if empty field
        empty: false,

        // max results
        limit: 5,

        callback: function (value, index, selected) {
            $('#list .example').text(selected.example)
            $('#list .example-cn').text(selected.examplecn)
            $('#list .idstr .val').text(selected.index)
            wordIndex = selected.index
        }
    });
}


function entryRandom() {
    $('#btn-random').on('click', function() {
        const item = DATA[Math.floor(Math.random() * DATA.length)]

        $('#random .word').html(item.word)
        $('#random .wordcn').html(item.wordcn)
        $('#random .example').html(item.example.replace(new RegExp(`(${item.word}[^\\s]*)`), `<span class='val'>$1</span>`))
        $('#random .examplecn').html(item.examplecn)
        $('#random .en-input').show()
    });

   


    ['word', 'wordcn', 'example', 'examplecn'].forEach((keyword) => {
        $('#random .ck-box .ck-' + keyword).prop('checked', settings[keyword])
        $('#random .bottom .' + keyword).toggle(settings[keyword])
    });

    $('#random').on('change', '[type=checkbox]', (e) => {

        const keyword = $(e.target).attr('class').replace('ck-', '')

        $('#random .bottom .' + keyword).toggle(e.target.checked)

        settings[keyword] = e.target.checked

        localStorage['words_settings'] = JSON.stringify(settings)
    })


}

function entryApp() {
    APP = new Vue({
        el: '#app',
        data() {
            return {
                WORD_LIST: []
            }
        }
    })
}