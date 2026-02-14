<script lang="ts">
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    import { getContext } from "svelte";
    import { getRpgSystem } from "src/utils";
    import type { RpgSystem } from "src/utils/rpg-system/rpgSystem";
    import type InitiativeTracker from "src/main";

    import { tracker } from "../stores/tracker";
    const { difficulty } = tracker;

    const plugin: InitiativeTracker = getContext("plugin");

    const dif = difficulty(plugin);

    const difficultyBar = tweened(0, {
        duration: 400,
        easing: cubicOut
    });

    // const difficultyLabels = /

    // $var = access store
    // $: = reactive statement
    $: {
        if ($dif.thresholds.last().minValue > 0) {
            difficultyBar.set(
                Math.min(
                    $dif.difficulty.value / $dif.thresholds.last().minValue,
                    1
                )
            );
        }
    }
    $: summary = $dif.difficulty.summary;
</script>

<div class="difficulty-bar-container" aria-label={summary}>
    <span>{$dif.labels?.[0] ?? ""}</span>
    <span
        ><meter
            class="difficulty-bar"
            min="0"
            low="0.33"
            high="0.66"
            optimum="0"
            value={$difficultyBar}
        />
        <ol class="thresholds">
            {#each $dif.thresholds as level}
                <li style="left:{level.minValue / $dif.thresholds.last().minValue * 100}%"><span>{level.displayName}</span></li>
            {/each}
        </ol>
    
    </span>
    <span>{$dif.labels?.last() ?? ""}</span>
</div>

<style>
    .difficulty-bar-container {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 0.5rem;
        align-items: start;
        padding: 0 0.5rem;
        margin-bottom: 0.5rem;
        width: 100%;
    }
    .difficulty-bar {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 3px;
    }

    .difficulty-bar-container .thresholds {
        list-style-type: none;
        margin:0;
        padding:0;
        position:relative;
        height:25px;
    }

    .difficulty-bar-container .thresholds li {
        display:inline-block;
        border-left:1px solid #ccc;
        position:absolute;
        width:0px;
        height:5px;
    }

    .difficulty-bar-container .thresholds li span {
        font-size:x-small;
        position:relative;
        top: 5px;
        text-align:center;
        display:inline-block;
        width:100px;
        left:-50px;
    }
</style>
