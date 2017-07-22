'use strict';

function formatMessage(event, payload) {
	let message = [];
	
	if (payload.repository) {
		message.push('[' + payload.repository.full_name + ']');
	}
	
	message.push(payload.sender.login);
	
	switch (event) {
		case 'commit_comment':
			message.push('commented on');
			message.push(payload.comment.commit_id);
			message.push('-');
			message.push(payload.comment.html_url);
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
			message.push(payload.action);
			message.push('a comment in this issue:');
			message.push(payload.issue.html_url);
			break;
		case 'issues':
			message.push(payload.action);
			message.push('the following issue:');
			message.push(payload.issue.html_url);
			break;
		case 'label':
			message.push(payload.action);
			message.push('label');
			message.push(payload.label.name);
			break;
		// case 'marketplace_purchase': // not supported by formatter
		case 'member':
			message.push(payload.action);
			message.push('member');
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
			message.push(payload.milestone.html_url);
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
			message.push(payload.action);
			message.push('pull request');
			message.push('#' + payload.pull_request.number);
			message.push(payload.pull_request.title);
			message.push(payload.pull_request.html_url);
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
							message.push(payload.after);
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
					message.push(payload.before);
				}
				else {
					if (payload.forced) {
						message.push('force-pushed');
						message.push(payload.ref_name);
						message.push('from');
						message.push(payload.before);
						message.push('to');
						message.push(payload.after);
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
								message.push(payload.before);
								message.push('to');
								message.push(payload.after);
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
			message.push(payload.release.html_url);
			break;
		case 'repository':
			message.push(payload.action);
			message.push('the repository');
			break;
		// case 'status': // not supported by formatter
		case 'team':
			message.push(payload.action);
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
	
	return message.join(' ');
}

module.exports = {
	formatMessage: formatMessage
};
