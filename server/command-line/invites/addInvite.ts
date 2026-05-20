import log from "../../log";
import colors from "chalk";
import {Command} from "commander";
import fs from "fs";
import Config from "../../config";
import Utils from "../utils";

const program = new Command("add-invite");
program
	.description("Add an invite code that can be used to create new accounts")
	.on("--help", Utils.extraHelp)
	.argument("[code]", "the invite code, will be randomly generated if not specified")
	.argument("[uses]", "the amount of times the invite can be used, defaults to 1")
	.action(function (code, uses) {
		if (!fs.existsSync(Config.getInvitePath())) {
			log.error(`${Config.getInvitePath()} does not exist.`);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const InviteManager = require("../../inviteManager").default;
		const manager = new InviteManager();

		if (!code) {
			code = '';
			let charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    		for (let i = 0; i < 8; i++) {
				code += charset.charAt(Math.floor(Math.random() * charset.length));
    		}
		} else {
			code = code.trim();
		}

		if (!uses) {
			uses = 1;
		} else {
			uses = parseInt(uses);
			if (isNaN(uses) || uses < 1) {
				log.error("Uses must be a positive integer.");
				return;
			}
		}
		
		manager.addInvite(code, uses);

		log.info(`Added invite code ${colors.bold(code)}.`);
	});

export default program;
