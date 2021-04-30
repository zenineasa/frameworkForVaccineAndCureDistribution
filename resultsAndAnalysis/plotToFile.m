function plotToFile (folder, filename)
% folder = 'Results/CASE1-None/';
% filename = 'simResults.xlsx';
data = readtable([folder filename]);

% All regions
allRegions_Uninfected = table2array(data(1,2:end));
allRegions_Sick = table2array(data(2,2:end));
allRegions_CuredOrImmune = table2array(data(3,2:end));
allRegions_Dead = table2array(data(4,2:end));

xmax = length(allRegions_Uninfected);
xmax = 200 * (floor(xmax/200) + 1);

figure(1);
set(gcf, 'Position', get(0, 'Screensize') ./ 2.75);
xlabel('Simulation time-steps');
ylabel('Number of People');
xticks(0:200:xmax);
yticks(0:200:1600);

hold on;
plot(allRegions_Uninfected);
plot(allRegions_Sick);
plot(allRegions_CuredOrImmune);
plot(allRegions_Dead);
legend({'Uninfected','Sick','Cured/Immune','Dead'},...
    'Location','northeast','Orientation','vertical')

print(gcf,[folder 'allregions.eps'],'-depsc','-r600');
close(gcf);

% Central city
centralCity_Uninfected = table2array(data(5,2:end));
centralCity_Sick = table2array(data(6,2:end));
centralCity_CuredOrImmune = table2array(data(7,2:end));
centralCity_Dead = table2array(data(8,2:end));

% Commenting out as the value is identical to what is
% calculated above.
%xmax = length(centralCity_Uninfected);
%xmax = 200 * (floor(xmax/200) + 1);

figure(2);
set(gcf, 'Position', get(0, 'Screensize') ./ 2.75);
xlabel('Simulation time-steps');
ylabel('Number of People');
xticks(0:200:xmax);
yticks(0:100:800);

hold on;
plot(centralCity_Uninfected);
plot(centralCity_Sick);
plot(centralCity_CuredOrImmune);
plot(centralCity_Dead);
legend({'Uninfected','Sick','Cured/Immune','Dead'},...
    'Location','northeast','Orientation','vertical')

print(gcf,[folder 'centralcity.eps'],'-depsc','-r600');
close(gcf);

end