import React from "react";
import { useTranslation } from "react-i18next";

const MemberCard = ({ member, role, isCurrentUser, onInvite, inviteRole, inviteColor = "bg-teal-800", onRemove }) => {
  const { t } = useTranslation();
  const TEXT_COLOR = "text-gray-700";

  const name = member?.userId?.name || (role === "Owner" ? t("ownerUser") : t("vacant"));

  const PlaceholderAvatar = () => (
    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-800 font-bold text-lg flex-shrink-0">
      {name[0] !== "?" ? name[0].toUpperCase() : "?"}
    </div>
  );

  return (
    <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-teal-100 min-h-[4rem] hover:shadow-md transition-shadow">
      {member?.userId ? (
        <>
          <PlaceholderAvatar />
          <div className="ml-4 flex-grow truncate">
            <p className={`font-medium ${TEXT_COLOR} truncate`}>{name}</p>
            <p className="text-sm text-teal-800 capitalize">
              {t(role.toLowerCase())}
              {isCurrentUser && <span className="text-blue-600 ml-1">({t("you")})</span>}
            </p>
          </div>
          {onRemove && !isCurrentUser && (
            <button
              onClick={() => onRemove(member.userId._id)}
              className="ml-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-red-500 transition-colors"
            >
              {t("remove")}
            </button>
          )}
        </>
      ) : (
        <div className="flex justify-between items-center w-full">
          <div className="text-gray-500 italic flex items-center">
            <div className="w-10 h-10 mr-3 bg-teal-50 rounded-full"></div>
            {t("vacant")} {t(role.toLowerCase())}
          </div>
          {onInvite && inviteRole && (
            <button
              onClick={() => onInvite(inviteRole)}
              className={`ml-2 ${inviteColor} text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors`}
            >
              {t("invite")}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function Members({ members, currentUserId, onInvite, onRemove }) {
  const { t } = useTranslation();

  const owner = members.find((m) => m.role === "owner");
  const manager = members.find((m) => m.role === "manager");
  const supervisors = members.filter((m) => m.role === "supervisor");
  const employees = members.filter((m) => m.role === "employee");

  const isCurrent = (member) => String(currentUserId) === String(member?.userId?._id);
  const isOwner = isCurrent(owner);
  const isManager = isCurrent(manager);

  return (
    <div className="space-y-6">
      {/* Owner */}
      <section className="space-y-2">
        <h2 className="text-lg font-bold text-teal-800">👑 {t("owner")}</h2>
        <MemberCard member={owner} role="Owner" isCurrentUser={isOwner} />
      </section>

      <hr className="border-t border-teal-100" />

      {/* Management */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-teal-800">💼 {t("managementTeam")}</h2>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">{t("manager")}</h3>
          <MemberCard
            member={manager}
            role="Manager"
            isCurrentUser={isManager}
            onInvite={isOwner ? onInvite : null}
            inviteRole="manager"
            inviteColor="bg-teal-800"
            onRemove={isOwner ? onRemove : null}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">
              {t("supervisors")} ({supervisors.length})
            </h3>
            {isOwner && (
              <button
                onClick={() => onInvite("supervisor")}
                className="bg-teal-800 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                {t("inviteSupervisor")}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {supervisors.length > 0 ? (
              supervisors.map((s) => (
                <MemberCard
                  key={s.userId?._id || `s-${Math.random()}`}
                  member={s}
                  role="Supervisor"
                  isCurrentUser={isCurrent(s)}
                  onRemove={isOwner ? onRemove : null}
                />
              ))
            ) : (
              <p className="text-gray-500 italic p-3 bg-white rounded-lg border border-teal-100">
                {t("noSupervisors")}
              </p>
            )}
          </div>
        </div>
      </section>

      <hr className="border-t border-teal-100" />

      {/* Employees */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-teal-800">
            👥 {t("employees")} ({employees.length})
          </h2>
          {(isOwner || isManager) && (
            <button
              onClick={() => onInvite("employee")}
              className="bg-teal-800 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              {t("inviteEmployee")}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {employees.length > 0 ? (
            employees.map((e) => (
              <MemberCard
                key={e.userId?._id || `e-${Math.random()}`}
                member={e}
                role="Employee"
                isCurrentUser={isCurrent(e)}
                onRemove={isOwner || isManager ? onRemove : null}
              />
            ))
          ) : (
            <p className="text-gray-500 italic p-3 bg-white rounded-lg border border-teal-100">
              {t("noEmployees")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
