const Team = require('../models/Team');
async function requireTeamMember(teamId, userId) {
  const team = await Team.findById(teamId);
  if (!team) return { error: 'Team not found.' };
  const membership = team.members.find((m) => m.user.equals(userId));
  if (!membership) return { error: 'You are not a member of this team.' };
  return { team, membership };
}
module.exports = { requireTeamMember };
