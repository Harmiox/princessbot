```Markdown
permissions.js
==============
!p <action> <attribute> <setting> <command(s)>;<argument(s)>
                            ^(only for attributes: users, roles, & channels)

    #ACTIONS
    set         | set the attribute
    reset       | reset the attribute
    view        | view the current settings for attribute

    #ATTRIBUTES
    description | The description for the command. What is sent for ?<command>.
    sends       | What PrincessBot sends when used.
    alias       | The alias'd command.
    cooldown    | The cooldown (in seconds).
    users       | The users allowed or denied.
    roles       | The roles allowed or denied.
    channels    | The channels allowed or denied.

    #SETTINGS
    allowed     | Only these are allowed. Example, if the allowed channels is set to #global-chat than the command can ONLY be used in #global-chat.

    denied      | These are denied. Example, if the denied channels is set to #global-chat than the command is denied in #global-chat.

    COMMANDS
    uses        | command
                | command1 command2
                | command1 command2 "command3 arg1 arg2"
    #ARGUMENTS
    description | Anything

    sends       | Anything

    alias       | command
                | "command arg1 arg2"

    cooldown    | Number (seconds)

    users       | @user
                | Username#1234
                | "User Name#1234"

    roles       | @role
                | RoleName
                | "Role Name"

    channels    | #channel
                | ChannelName
                | "Channel Name"
```
