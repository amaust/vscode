/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IDisposable } from 'vs/base/common/lifecycle';
import { ThemeColor } from 'vs/base/common/themables';
import { Command } from 'vs/editor/common/languages';
import { IMarkdownString } from 'vs/base/common/htmlContent';
import { ColorIdentifier } from 'vs/platform/theme/common/colorRegistry';
import { IAuxiliaryStatusbarPart, IStatusbarEntryContainer } from 'vs/workbench/browser/parts/statusbar/statusbarPart';

export const IStatusbarService = createDecorator<IStatusbarService>('statusbarService');

export interface IStatusbarService extends IStatusbarEntryContainer {

	readonly _serviceBrand: undefined;

	/**
	 * Get the status bar part that is rooted in the provided container.
	 */
	getPart(container: HTMLElement): IStatusbarEntryContainer;

	/**
	 * Creates a new auxililary status bar part in the provided container.
	 */
	createAuxiliaryStatusbarPart(container: HTMLElement): IAuxiliaryStatusbarPart;
}

export const enum StatusbarAlignment {
	LEFT,
	RIGHT
}

export interface IStatusbarEntryLocation {

	/**
	 * The identifier of another status bar entry to
	 * position relative to.
	 */
	id: string;

	/**
	 * The alignment of the status bar entry relative
	 * to the referenced entry.
	 */
	alignment: StatusbarAlignment;

	/**
	 * Whether to move the entry close to the location
	 * so that it appears as if both this entry and
	 * the location belong to each other.
	 */
	compact?: boolean;
}

export function isStatusbarEntryLocation(thing: unknown): thing is IStatusbarEntryLocation {
	const candidate = thing as IStatusbarEntryLocation | undefined;

	return typeof candidate?.id === 'string' && typeof candidate.alignment === 'number';
}

export interface IStatusbarEntryPriority {

	/**
	 * The main priority of the entry that
	 * defines the order of appearance:
	 * either a number or a reference to
	 * another status bar entry to position
	 * relative to.
	 *
	 * May not be unique across all entries.
	 */
	readonly primary: number | IStatusbarEntryLocation;

	/**
	 * The secondary priority of the entry
	 * is used in case the main priority
	 * matches another one's priority.
	 *
	 * Should be unique across all entries.
	 */
	readonly secondary: number;
}

export function isStatusbarEntryPriority(thing: unknown): thing is IStatusbarEntryPriority {
	const candidate = thing as IStatusbarEntryPriority | undefined;

	return (typeof candidate?.primary === 'number' || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === 'number';
}

export const ShowTooltipCommand: Command = {
	id: 'statusBar.entry.showTooltip',
	title: ''
};

export interface IStatusbarStyleOverride {
	readonly priority: number; // lower has higher priority
	readonly foreground?: ColorIdentifier;
	readonly background?: ColorIdentifier;
	readonly border?: ColorIdentifier;
}

export type StatusbarEntryKind = 'standard' | 'warning' | 'error' | 'prominent' | 'remote' | 'offline';
export const StatusbarEntryKinds: StatusbarEntryKind[] = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];

/**
 * A declarative way of describing a status bar entry
 */
export interface IStatusbarEntry {

	/**
	 * The (short) name to show for the entry like 'Language Indicator',
	 * 'Git Status' etc.
	 */
	readonly name: string;

	/**
	 * The text to show for the entry. You can embed icons in the text by leveraging the syntax:
	 *
	 * `My text $(icon name) contains icons like $(icon name) this one.`
	 */
	readonly text: string;

	/**
	 * Text to be read out by the screen reader.
	 */
	readonly ariaLabel: string;

	/**
	 * Role of the status bar entry which defines how a screen reader interacts with it.
	 * Default is 'button'.
	 */
	readonly role?: string;

	/**
	 * An optional tooltip text to show when you hover over the entry
	 */
	readonly tooltip?: string | IMarkdownString | HTMLElement;

	/**
	 * An optional color to use for the entry.
	 *
	 * @deprecated Use `kind` instead to support themable hover styles.
	 */
	readonly color?: string | ThemeColor;

	/**
	 * An optional background color to use for the entry.
	 *
	 * @deprecated Use `kind` instead to support themable hover styles.
	 */
	readonly backgroundColor?: string | ThemeColor;

	/**
	 * An optional command to execute on click.
	 *
	 * Can use the special `ShowTooltipCommand` to
	 * show the tooltip on click if provided.
	 */
	readonly command?: string | Command | typeof ShowTooltipCommand;

	/**
	 * Whether to show a beak above the status bar entry.
	 */
	readonly showBeak?: boolean;

	/**
	 * Will enable a spinning icon in front of the text to indicate progress. When `true` is
	 * specified, `syncing` will be used.
	 */
	readonly showProgress?: boolean | 'syncing' | 'loading';

	/**
	 * The kind of status bar entry. This applies different colors to the entry.
	 */
	readonly kind?: StatusbarEntryKind;
}

export interface IStatusbarEntryAccessor extends IDisposable {

	/**
	 * Allows to update an existing status bar entry.
	 */
	update(properties: IStatusbarEntry): void;
}
