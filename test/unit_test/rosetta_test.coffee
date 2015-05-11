define ['rosetta'], (Rosetta) ->
    describe 'getElemClass', ->


    describe 'addElemClass', ->

    describe 'addElem', ->

    describe 'register', ->
        it 'obj validate', ->
            newClass = Rosetta.register('r-tab', ()->)

            expect((new newClass()).type).toEqual('r-tab')

    describe 'render', ->
        it 'render', ->
            Rosetta.register 'r-tab', ()->
                node1 = document.createElement('div')
                node1.setAttribute('class', 'r-tab')
                return node1

            node2 = Rosetta.create 'r-tab', {
                link: 'adsdsds'
            }

            Rosetta.render node2, 'body'
            expect(document.querySelectorAll('.r-tab').length).toEqual(1)


    describe 'create', ->
        it 'node', ->
            node1 = Rosetta.create 'div', {
                'data-a': 'ad'
                'ddd': 'aaaa'
            }

            expect(node1.getAttribute('data-a')).toEqual('ad')
            console.log(node1.getAttribute('ddd'))

            Rosetta.register 'r-tab', ()->
            node2 = Rosetta.create 'r-tab', {
                link: 'adsdsds'
            }

            window.node2 = node2

            expect(node2.attr.link).toEqual('adsdsds')
            console.log(node2.attr)

    describe 'events', ->
        it 'on', ->
            Rosetta.register 'r-tab', ()->

            node1 = Rosetta.create 'r-tab', {
                link: 'adsdsds'
            }

            node1.on 'updated', (e) ->
                console.log e

            node1.trigger 'updated', {a: 1}


            node1.update()
