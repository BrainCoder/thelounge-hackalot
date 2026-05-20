/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import fs from "fs";
import os from "os";
import _ from "lodash";
import colors from "chalk";
import {SearchOptions} from "ldapjs";

import log from "./log";
import Helper from "./helper";
import Utils from "./command-line/utils";
import Config from "./config";
import storage from "./plugins/storage";

export type Invite = {
	code: string;
	uses: number;
}

class InviteManager {
	invites: Invite[];

	constructor() {
		this.invites = [];
	}

	init() {
		this.loadInvites();
	}
	
	loadInvites() {
		const invitePath = Config.getInvitePath();
		if (!fs.existsSync(invitePath)) {
			log.warn(`${invitePath} does not exist, creating it.`);
			fs.writeFileSync(invitePath, JSON.stringify(this.invites, null, "\t"), {
				mode: 0o600,
			});
			return;
		}

		try {
			const data = fs.readFileSync(invitePath, "utf-8");
			this.invites = JSON.parse(data) as Invite[];
		} catch (e: any) {
			log.error(`Failed to read invites file: ${e}`);
		}
	}

	addInvite(code: string, uses: number | null) {
		let invite: Invite = {
			code,
			uses: uses || 1
		}

		this.invites.push(invite);

		this.storeInvites();
	}

	useInvite(code: string) {

		const invite = this.invites.find(i => i.code === code);

		if (!invite) {
			return false;
		}

		if (invite.uses !== -1) {
			invite.uses--;

			if (invite.uses <= 0) {
				this.invites = this.invites.filter(i => i.code !== code);
			}
		}		

		this.storeInvites();
		return true;
	}

	storeInvites() {
		const invitePath = Config.getInvitePath();
		try {
			const tmpPath = invitePath + ".tmp";
			fs.writeFileSync(tmpPath, JSON.stringify(this.invites, null, "\t"), {
				mode: 0o600,
			});
			fs.renameSync(tmpPath, invitePath);
		} catch (e: any) {
			log.error(`Failed to create invite (${e})`);
			throw e;
		}
	}
}

export default InviteManager;
