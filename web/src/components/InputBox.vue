<template>
    <div class="container">
        <form>
            <label for="text1">Text 1:</label>
            <br>
            <textarea id="text1" rows="4" cols="50"></textarea>
            <br>
            <button type="button" @click="compare()">Compare</button>
        </form>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    name: 'InputBox',
    data() {
        return {
            text1: '',
            text2: '',
            differences: '',
        }
    },
    methods: {
        compare() {
            // let text1 = document.getElementById('text1').value;
            // let text2 = document.getElementById('text2').value;
            // let differences = document.getElementById('differences');
            // differences.innerHTML = '';
            // let diff = JsDiff.diffWords(text1, text2);
            // diff.forEach(function(part){
            //     // green for additions, red for deletions
            //     // grey for common parts
            //     let color = part.added ? 'green' :
            //         part.removed ? 'red' : 'grey';
            //     let span = document.createElement('span');
            //     span.style.color = color;
            //     span.appendChild(document
            //         .createTextNode(part.value));
            //     differences.appendChild(span);
            // });
            console.log('compare')
        }
    }
}
</script>

<style scoped>

</style>
