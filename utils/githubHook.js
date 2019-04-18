'use strict';

const hashAbbrevLength = 7;

function formatHash(longHash) {
	return longHash.substr(0, hashAbbrevLength);
}

function formatMessage(utils, event, payload, callback) {
	let message = [];
	
	if (payload.repository) {
		message.push('[' + payload.repository.full_name + ']');
	}
	
	if (payload.sender) {
		message.push(payload.sender.login);
	}
	
	switch (event) {
		case 'commit_comment':
			message.push('commented on');
			message.push(formatHash(payload.comment.commit_id));
			message.push('-');
			utils.url.shorten(utils.request, payload.comment.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		case 'create':
			message.push('created');
			message.push(payload.ref_type);
			message.push(payload.ref);
			break;
		case 'delete':
			message.push('deleted');
			message.push(payload.ref_type);
			message.push(payload.ref);
			break;
		// case 'deployment': // not supported by formatter
		// case 'deployment_status': // not supported by formatter
		// case 'download': // no longer created
		// case 'follow': // no longer created
		case 'fork':
			message.push('forked the repository to');
			message.push(payload.forkee.html_url);
			break;
		// case 'fork_apply': // no longer created
		// case 'gist': // no longer created
		// case 'gollum': // not supported by formatter
		// case 'installation': // not supported by formatter
		// case 'installation_repositories': // not supported by formatter
		case 'issue_comment':
			switch (payload.action) {
				case 'created':
					message.push('commented in');
					break;
				case 'edited':
					message.push('edited a comment in');
					break;
				case 'deleted':
					message.push('deleted a comment in');
					break;
			}
			message.push('#' + payload.issue.number);
			message.push('(' + payload.issue.title + ')');
			message.push('-');
			utils.url.shorten(utils.request, payload.comment.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		case 'issues':
			switch (payload.action) {
				case 'assigned':
					if (payload.sender.id === payload.assignee.id) {
						message.push('self-' + payload.action);
					}
					else {
						message.push(payload.action);
					}
					break;
				case 'unassigned':
					if (payload.sender.id === payload.assignee.id) {
						message.push('removed their assignment from');
					}
					else {
						message.push(payload.action);
					}
					break;
				case 'labeled':
					message.push('added the');
					message.push('"' + payload.label.name + '"');
					message.push('label to');
					break;
				case 'unlabeled':
					message.push('removed');
					if ('label' in payload) {
						message.push('the');
						message.push('"' + payload.label.name + '"');
						message.push('label');
					}
					else {
						message.push('a label');
					}
					message.push('from');
					break;
				case 'milestoned':
					message.push('added');
					break;
				case 'demilestoned':
					message.push('removed');
					break;
				default:
					message.push(payload.action);
					break;
			}
			message.push('#' + payload.issue.number);
			message.push('(' + payload.issue.title + ')');
			switch (payload.action) {
				case 'assigned':
					if (payload.sender.id !== payload.assignee.id) {
						message.push('to');
						message.push(payload.assignee.login);
					}
					break;
				case 'unassigned':
					if (payload.sender.id !== payload.assignee.id) {
						message.push('from');
						message.push(payload.assignee.login);
					}
					break;
				case 'milestoned':
					message.push('to the');
					message.push('"' + payload.issue.milestone.title + '"');
					message.push('milestone');
					break;
				case 'demilestoned':
					message.push('from its milestone');
					break;
			}
			message.push('-');
			utils.url.shorten(utils.request, payload.issue.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		case 'label':
			message.push(payload.action);
			message.push('label');
			message.push(payload.label.name);
			break;
		// case 'marketplace_purchase': // not supported by formatter
		case 'member':
			if (payload.sender.id === payload.member.id) {
				switch (payload.action) {
					case 'added':
						message.push('joined the repository');
						break;
					case 'edited':
						message.push('edited their permissions to the repository');
						break;
					case 'deleted':
						message.push('left the repository');
						break;
				}
				break;
			}
			
			message.push(payload.action);
			
			if (payload.action === 'edited') {
				message.push('the permissions of');
			}
			
			message.push(payload.member.login);
			break;
		case 'membership':
			message.push(payload.action);
			message.push('user');
			message.push(payload.member.login);
			message.push(payload.action === 'added' ? 'to' : 'from');
			message.push(payload.scope);
			message.push(payload.team.name);
			break;
		case 'milestone':
			message.push(payload.action);
			message.push('milestone');
			message.push(payload.milestone.title);
			utils.url.shorten(utils.request, payload.milestone.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		// case 'organization': // not supported by formatter
		// case 'org_block': // not supported by formatter
		// case 'page_build': // not supported by formatter
		// case 'project_card': // not supported by formatter
		// case 'project_column': // not supported by formatter
		case 'project':
			message.push(payload.action);
			message.push('project');
			message.push(payload.project.name);
			break;
		case 'public':
			message.push('made the repository public');
			break;
		case 'pull_request':
			switch (payload.action) {
				case 'review_requested':
					message.push('requested review in');
					break;
				case 'review_request_removed':
					message.push('removed a review request in');
					break;
				default:
					message.push(payload.action);
					break;
			}
			message.push('pull request');
			message.push('#' + payload.pull_request.number);
			message.push('(' + payload.pull_request.title + ')');
			message.push('-');
			utils.url.shorten(utils.request, payload.pull_request.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		// case 'pull_request_review': // not supported by formatter
		// case 'pull_request_review_comment': // not supported by formatter
		case 'push':
			if (payload.created) {
				if (payload.ref.indexOf('refs/tags/') === 0) {
					message.push('tagged');
					message.push(payload.ref_name);
					message.push('at');
					message.push(payload.base_ref_name ? payload.base_ref_name : payload.after);
				}
				else {
					message.push('created');
					message.push(payload.ref.indexOf('refs/heads/') === 0 ?
						payload.ref.substr('refs/heads/'.length) :
						payload.ref
					);
					
					if (payload.base_ref_name) {
						message.push('from');
						message.push(payload.base_ref_name);
					}
					else {
						if (
							!payload.distinct_commits ||
							payload.distinct_commits.length === 0
						) {
							message.push('at');
							message.push(formatHash(payload.after));
						}
					}
					
					const num = (payload.distinct_commits || []).length;
					message.push('(+');
					message.push(num);
					message.push('new commit' + (num !== 1 ? 's' : '') + ')');
				}
			}
			else {
				if (payload.deleted) {
					message.push('deleted');
					message.push(payload.ref_name);
					message.push('at');
					message.push(formatHash(payload.before));
				}
				else {
					if (payload.forced) {
						message.push('force-pushed');
						message.push(payload.ref_name);
						message.push('from');
						message.push(formatHash(payload.before));
						message.push('to');
						message.push(formatHash(payload.after));
					}
					else {
						if (payload.commits && !payload.distinct_commits) {
							if (payload.base_ref_name) {
								message.push('merged');
								message.push(payload.base_ref_name);
								message.push('into');
								message.push(payload.ref_name);
							}
							else {
								message.push('fast-forwarded');
								message.push(payload.ref_name);
								message.push('from');
								message.push(formatHash(payload.before));
								message.push('to');
								message.push(formatHash(payload.after));
							}
						}
						else {
							const num = (payload.distinct_commits || []).length;
							message.push('pushed');
							message.push(num);
							message.push('new commit' + (num !== 1 ? 's' : ''));
							message.push('to');
							message.push(payload.ref_name);
						}
					}
				}
			}
			break;
		case 'release':
			message.push(payload.action);
			message.push('release');
			message.push(payload.release.tag_name);
			utils.url.shorten(utils.request, payload.release.html_url, function(url) {
				message.push(url);
				callback(message.join(' '));
			});
			return;
			break;
		case 'repository':
			message.push(payload.action);
			message.push('the repository');
			break;
		case 'repository_vulnerability_alert':
			message.push('Vulnerability alert');
			message.push(payload.action);
			message.push('in package');
			message.push(payload.alert.affected_package_name);
			message.push(payload.alert.affected_range);
			if (payload.alert.dismisser) {
				message.push('by');
				message.push(payload.alert.dismisser.login);
			}
			message.push(', problem fixed in');
			message.push(payload.alert.fixed_in);
			break;
		case 'status':
			if (payload.state === 'pending') {
				// too much spam
				return;
			}
			
			message.push('changed status of commit');
			message.push(formatHash(payload.sha));
			message.push('to');
			message.push(payload.state);
			
			if (payload.description) {
				message.push('(' + payload.description + ')');
			}
			
			if (payload.target_url) {
				message.push('-');
				utils.url.shorten(utils.request, payload.target_url, function(url) {
					message.push(url);
					callback(message.join(' '));
				});
				return;
			}
			break;
		case 'team':
			message.push(payload.action.replace('_', ' '));
			message.push('team');
			message.push(payload.team.name);
			break;
		// case 'team_add': // not supported by formatter
		case 'watch': // https://developer.github.com/changes/2012-09-05-watcher-api/
			message.push('starred the repository');
			break;
		default:
			message.push('triggered event');
			message.push(event);
			break;
	}
	
	callback(message.join(' '));
}

function sendMessage(ircbot, utils, recipient, event, payload) {
	formatMessage(utils, event, payload, function(message) {
		ircbot.say(recipient, message);
	});
}

module.exports = {
	formatMessage: formatMessage,
	sendMessage: sendMessage
};
