import type InitiativeTracker from "src/main";
import type { DifficultyLevel, GenericCreature, DifficultyThreshold } from ".";
import {
    DEFAULT_UNDEFINED,
    convertFraction,
    crToString,
    getFromCreatureOrBestiary
} from "src/utils";
import { RpgSystem } from "./rpgSystem";
import { Dnd5eRpgSystem } from "./dnd5e";
import { ReasonNoXp, type CreatureDifficulty } from "src/types/creatures";

export class Dnd5eLazyGmRpgSystem extends RpgSystem {
    plugin: InitiativeTracker;
    dnd5eRpgSystem: Dnd5eRpgSystem;

    override systemDifficulties: [string, string, ...string[]] = [
		"Not Deadly",
		"Deadly"
	]

    constructor(plugin: InitiativeTracker) {
        super();
        this.plugin = plugin;
        this.valueUnit = "CR";
        this.displayName = "DnD 5e Lazy GM";
        this.dnd5eRpgSystem = new Dnd5eRpgSystem(plugin);
    }

    getCreatureDifficulty(creature: GenericCreature, _?: number[]): CreatureDifficulty {
        const bestiary_creature = getFromCreatureOrBestiary(this.plugin, creature, (c) => c?.cr ?? 0);

        if (bestiary_creature == null || bestiary_creature == undefined) {
            return {xp: 0, reason_no_xp:ReasonNoXp.NOT_IN_BESTIARY}
        }

        const xp = convertFraction(bestiary_creature);

        if (xp == 0) {
            return {xp: 0, reason_no_xp:ReasonNoXp.INVALID_DIFFICULTY}
        }
        
        return {xp: xp}
    }

    getAdditionalCreatureDifficultyStats(
        creature: GenericCreature,
        _?: number[]
    ): string[] {
        const difficulty = this.dnd5eRpgSystem.getCreatureDifficulty(creature);
        return [this.dnd5eRpgSystem.formatDifficultyValue(difficulty.xp, true)];
    }

    getDifficultyThresholds(playerLevels: number[]): DifficultyThreshold[] {
        const totalLevels = playerLevels.reduce((acc, lv) => acc + lv, 0);
        const avgLevel =
            playerLevels.length > 0 ? totalLevels / playerLevels.length : 0;
        return [
            {
                displayName: "Deadly",
                minValue: totalLevels / (avgLevel > 4 ? 2 : 4)
            }
        ];
    }

    getEncounterDifficulty(
        creatures: Map<GenericCreature, number>,
        playerLevels: number[]
    ): DifficultyLevel {
        const crSum = [...creatures].reduce(
            (acc, [creature, count]) =>
                acc + this.getCreatureDifficulty(creature).xp * count,
            0
        );
        const deadlyThreshold =
            this.getDifficultyThresholds(playerLevels).first()?.minValue ?? 0;
        const displayName = crSum > deadlyThreshold ? "Deadly" : "Not Deadly";
        const xp = [...creatures].reduce(
            (acc, [creature, count]) =>
                acc +
                this.dnd5eRpgSystem.getCreatureDifficulty(creature).xp * count,
            0
        );

        const summary = `Encounter is ${displayName}
Total XP: ${xp}
Total CR: ${crSum}
Total levels: ${playerLevels.reduce((acc, lv) => acc + lv, 0)}
Deadly Threshold: ${deadlyThreshold}`;

        return {
            displayName,
            summary,
            cssClass: displayName == "Deadly" ? "deadly" : "easy",
            value: crSum,
            title: "Total CR",
            intermediateValues: [{ label: "Total XP", value: xp }]
        };
    }

    formatDifficultyValue(value: number, withUnits?: boolean): string {
        if (!value) return DEFAULT_UNDEFINED;
        return crToString(value) + (withUnits ? " CR" : "");
    }
}
