<script lang="ts">
    import { BaseComponent, ButtonComponent, ExtraButtonComponent, setIcon, TextComponent } from "obsidian";
    import type InitiativeTracker from "src/main";
    import { ReasonNoXp, type CreatureDifficulty } from "src/types/creatures";
    import { FRIENDLY, HIDDEN, INFO_ICON, INFO_VIEW, RANDOM_HP, getRpgSystem } from "src/utils";
    import type { Creature } from "src/utils/creature";
    import { getContext } from "svelte";

    const plugin = getContext<InitiativeTracker>("plugin");
    const rpgSystem = getRpgSystem(plugin);

    export let creature: Creature;
    export let count: string | number;
    export let difficulty: CreatureDifficulty;
    export let shouldShowRoll: boolean;

    const rollEl = (node: HTMLElement) => {
        setIcon(node, RANDOM_HP);
    };
    const friendly = (node: HTMLElement) => {
        setIcon(node, FRIENDLY);
    };
    const hidden = (node: HTMLElement) => {
        setIcon(node, HIDDEN);
    };

    const reasonNoXpDisplayLabel:Record<number, string> = Object.fromEntries(
        new Map([
            [ReasonNoXp.DEFINED_AS_ZERO, "The XP for this creature is set to 0"],
            [ReasonNoXp.INVALID_DIFFICULTY, "The calculated difficulty is invalid"],
            [ReasonNoXp.NOT_IN_BESTIARY, "Creature not found in definition or in bestiary"],
            [ReasonNoXp.TOO_EASY, "This creature is too easy to grant any XP"],
            [ReasonNoXp.TOO_HARD, "This creature is too hard to define any XP"]
        ])
    );

    const noXpInfo = (node: HTMLElement) => {

    };
</script>

<slot />
<div class="creature-container">
    {#if creature.friendly}
        <span class="has-icon" use:friendly />
    {/if}
    {#if creature.hidden}
        <span class="has-icon" use:hidden />
    {/if}
    <span class="creature-name" on:click={() => plugin.openCombatant(creature)}>
        {#if creature.display && creature.display != creature.name}
            {creature.display}{count == 1 ? "" : "s"} ({creature.name})
        {:else}
            {creature.name}{count == 1 ? "" : "s"}
        {/if}
        {#if shouldShowRoll && creature.hit_dice?.length}
            <span class="has-icon" aria-label="Rolling for HP" use:rollEl />
        {/if}
    </span>
    {#if difficulty.xp}
        <span class="xp-parent">
            <span class="paren left">&nbsp;(</span>
            <span class="xp-container">
                <span class="xp number"
                    >{rpgSystem.formatDifficultyValue(difficulty.xp)}</span
                >
                <span class="xp text">{rpgSystem.valueUnit}</span>
            </span>
            <span class="paren right">)</span>
        </span>
    {:else}
        <span 
            class="no-xp-info"
            aria-label="{reasonNoXpDisplayLabel[difficulty.reason_no_xp]}"
        >
        {@html INFO_ICON}
        </span>
    {/if}
</div>

<style>
    .has-icon,
    .creature-container {
        display: inline-flex;
        align-items: center;
    }
    .creature-name {
        cursor: pointer;
    }
    .creature-name {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }
    .has-icon {
        display: flex;
        align-items: center;
    }
    .xp-parent {
        display: inline-flex;
    }
    .no-xp-info {
        color: var(--icon-color);
        cursor: default;
        margin-left: 0.5em;
    }
    .no-xp-info :global(svg) {
        width:1em;
        vertical-align: bottom;
    }
</style>
