const models = require("../models");
const { sequelize } = require("../models");
const { Op, where } = require("sequelize");
const moment = require("moment");

const createSprint = async (payload, user) => {
  const checkWorkspace = await models.Workspace.findOne({
    where: { id: payload.workspaceId },
  });
  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }

  const currentTimeDateTime = moment().format("YYYY-MM-DD HH:mm:s");
  const deadline = payload.deadline;
  if (deadline <= currentTimeDateTime) {
    throw new Error("Invalid deadline");
  }
  const designation = await models.Designation.findOne({
    where: { designationCode: 103 },
  });
  const isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { user_id: user.id },
        { workspace_id: payload.workspaceId },
        { designation_id: designation.id },
      ],
    },
  });
  if (!isLeadWorkspace) {
    throw new Error("Access denied");
  }

  const sprint = await models.Sprint.create(payload);
  return sprint;
};

const updateSprint = async (payload, user, paramsData) => {
  const checkSprint = await models.Sprint.findOne({
    where: { id: paramsData.sprintId },
  });
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }
  const designation = await models.Designation.findOne({
    where: { designationCode: 103 },
  });
  let isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { user_id: user.id },
        { workspace_id: checkSprint.dataValues.workspaceId },
        { designation_id: designation.id },
      ],
    },
  });
  if (!isLeadWorkspace) {
    throw new Error("Access denied");
  }

  const sprint = await models.Sprint.update(payload, {
    where: { id: paramsData.sprintId },
  });

  return "sprint updated successfully";
};

const deleteSprint = async (user, paramsData) => {
  const checkSprint = await models.Sprint.findOne({
    where: { id: paramsData.sprintId },
  });
  if (!checkSprint) {
    throw new Error("Sprint not found");
  }
  const trans = await sequelize.transaction();
  try {
    const designation = await models.Designation.findOne({
      where: { designationCode: 103 },
    });
    let isLeadWorkspace = await models.UserWorkspaceMapping.findOne({
      where: {
        [Op.and]: [
          { user_id: user.id },
          { workspace_id: checkSprint.dataValues.workspaceId },
          { designation_id: designation.id },
        ],
      },
    });

    if (!isLeadWorkspace) {
      throw new Error("Access denied");
    }
    const task = await models.Task.destroy(
      {
        where: { sprintId: paramsData.sprintId },
      },
      { transaction: trans }
    );

    const sprint = await models.Sprint.destroy(
      {
        where: { id: paramsData.sprintId },
      },
      { transaction: trans }
    );

    await trans.commit();
    return "sprint deleted successfully";
  } catch (error) {
    await trans.rollback();
    console.log(error.message);
    return { data: null, error: error };
  }
};

const mySprint = async (user, paramsData) => {
  const checkWorkspace = await models.UserWorkspaceMapping.findOne({
    where: {
      [Op.and]: [
        { user_id: user.id },
        { workspace_id: paramsData.workspaceId },
      ],
    },
  });

  if (!checkWorkspace) {
    throw new Error("Workspace not found");
  }

  const sprint = await models.Sprint.findAll({
    where: { workspaceId: checkWorkspace.workspace_id },
  });
  return sprint;
};

module.exports = {
  createSprint,
  updateSprint,
  deleteSprint,
  mySprint,
};
